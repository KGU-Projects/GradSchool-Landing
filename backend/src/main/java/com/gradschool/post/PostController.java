package com.gradschool.post;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 일반 사용자는 로그인 없이 닉네임+비밀번호로 글/댓글을 작성하고, 같은 비밀번호로 수정·삭제한다.
 * 관리자는 모든 글/댓글을 삭제할 수 있고, 공지(NOTICE)·상단 고정은 관리자만 가능하다.
 */
@RestController
@RequestMapping("/api/posts")
public class PostController {
    record PostSummary(Long id, Post.Category category, String title, String author, boolean pinned,
                       int viewCount, long commentCount, LocalDateTime createdAt) {}
    record CommentView(Long id, String author, String content, LocalDateTime createdAt) {}
    record PostDetail(Long id, Post.Category category, String title, String content, String author, boolean pinned,
                      int viewCount, LocalDateTime createdAt, LocalDateTime updatedAt, List<CommentView> comments) {}

    record PostCreate(@NotNull Post.Category category, @NotBlank @Size(max = 150) String title,
                      @NotBlank @Size(max = 20000) String content, @NotBlank @Size(max = 30) String author,
                      @Size(min = 4, max = 50) String password, Boolean pinned) {}
    record PostUpdate(@NotBlank @Size(max = 150) String title, @NotBlank @Size(max = 20000) String content,
                      String password, Boolean pinned) {}
    record CommentCreate(@NotBlank @Size(max = 30) String author, @Size(min = 4, max = 50) String password,
                         @NotBlank @Size(max = 1000) String content) {}

    private final PostRepository posts;
    private final CommentRepository comments;
    private final PasswordEncoder encoder;

    public PostController(PostRepository posts, CommentRepository comments, PasswordEncoder encoder) {
        this.posts = posts; this.comments = comments; this.encoder = encoder;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public Page<PostSummary> list(@RequestParam(required = false) Post.Category category,
                                  @RequestParam(required = false) String q,
                                  @RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "10") int size) {
        String query = (q == null || q.isBlank()) ? null : q.trim();
        return posts.search(category, query, PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 50)))
                .map(p -> new PostSummary(p.getId(), p.getCategory(), p.getTitle(), p.getAuthor(), p.isPinned(),
                        p.getViewCount(), comments.countByPostId(p.getId()), p.getCreatedAt()));
    }

    @GetMapping("/{id}")
    @Transactional
    public PostDetail get(@PathVariable Long id) {
        Post p = find(id);
        posts.increaseView(id);
        return new PostDetail(p.getId(), p.getCategory(), p.getTitle(), p.getContent(), p.getAuthor(), p.isPinned(),
                p.getViewCount() + 1, p.getCreatedAt(), p.getUpdatedAt(),
                p.getComments().stream().map(c -> new CommentView(c.getId(), c.getAuthor(), c.getContent(), c.getCreatedAt())).toList());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Long> create(@Valid @RequestBody PostCreate r, Authentication auth) {
        boolean admin = isAdmin(auth);
        if ((r.category() == Post.Category.NOTICE || Boolean.TRUE.equals(r.pinned())) && !admin)
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "공지/상단 고정은 관리자만 설정할 수 있습니다.");
        if (!admin && (r.password() == null || r.password().isBlank()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "비밀번호(4자 이상)를 입력해 주세요.");
        Post p = new Post();
        p.setCategory(r.category()); p.setTitle(r.title().trim()); p.setContent(r.content());
        p.setAuthor(admin ? "관리자" : r.author().trim());
        p.setPasswordHash(encoder.encode(admin ? "" : r.password()));
        p.setPinned(admin && Boolean.TRUE.equals(r.pinned()));
        return Map.of("id", posts.save(p).getId());
    }

    @PutMapping("/{id}")
    @Transactional
    public void update(@PathVariable Long id, @Valid @RequestBody PostUpdate r, Authentication auth) {
        Post p = find(id);
        authorize(auth, r.password(), p.getPasswordHash());
        p.setTitle(r.title().trim()); p.setContent(r.content());
        if (isAdmin(auth) && r.pinned() != null) p.setPinned(r.pinned());
        p.setUpdatedAt(LocalDateTime.now());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @RequestHeader(value = "X-Password", required = false) String password,
                       Authentication auth) {
        Post p = find(id);
        authorize(auth, password, p.getPasswordHash());
        posts.delete(p);
    }

    @PostMapping("/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentView addComment(@PathVariable Long id, @Valid @RequestBody CommentCreate r, Authentication auth) {
        boolean admin = isAdmin(auth);
        if (!admin && (r.password() == null || r.password().isBlank()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "비밀번호(4자 이상)를 입력해 주세요.");
        Comment c = new Comment();
        c.setPost(find(id));
        c.setAuthor(admin ? "관리자" : r.author().trim());
        c.setPasswordHash(encoder.encode(admin ? "" : r.password()));
        c.setContent(r.content());
        c = comments.save(c);
        return new CommentView(c.getId(), c.getAuthor(), c.getContent(), c.getCreatedAt());
    }

    @DeleteMapping("/{id}/comments/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(@PathVariable Long id, @PathVariable Long commentId,
                              @RequestHeader(value = "X-Password", required = false) String password, Authentication auth) {
        Comment c = comments.findById(commentId).filter(x -> x.getPost().getId().equals(id))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        authorize(auth, password, c.getPasswordHash());
        comments.delete(c);
    }

    private Post find(Long id) {
        return posts.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "게시글을 찾을 수 없습니다."));
    }

    private boolean isAdmin(Authentication a) {
        return a != null && a.getAuthorities().stream().anyMatch(g -> g.getAuthority().equals("ROLE_ADMIN"));
    }

    private void authorize(Authentication auth, String rawPassword, String hash) {
        if (isAdmin(auth)) return;
        if (rawPassword == null || !encoder.matches(rawPassword, hash))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "비밀번호가 일치하지 않습니다.");
    }
}
