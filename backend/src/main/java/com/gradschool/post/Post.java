package com.gradschool.post;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Post {
    public enum Category { NOTICE, FREE, QNA, ARCHIVE }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private Category category;
    @Column(nullable = false) private String title;
    @Column(nullable = false, columnDefinition = "text") private String content;
    @Column(nullable = false) private String author;
    @Column(nullable = false) private String passwordHash;   // 익명 작성자 수정/삭제용 (관리자 글은 빈 값)
    private boolean pinned;
    private int viewCount;
    @Column(nullable = false) private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "post", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<Comment> comments = new ArrayList<>();

    public Long getId() { return id; }
    public Category getCategory() { return category; }
    public void setCategory(Category v) { category = v; }
    public String getTitle() { return title; }
    public void setTitle(String v) { title = v; }
    public String getContent() { return content; }
    public void setContent(String v) { content = v; }
    public String getAuthor() { return author; }
    public void setAuthor(String v) { author = v; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String v) { passwordHash = v; }
    public boolean isPinned() { return pinned; }
    public void setPinned(boolean v) { pinned = v; }
    public int getViewCount() { return viewCount; }
    public void setViewCount(int v) { viewCount = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime v) { updatedAt = v; }
    public List<Comment> getComments() { return comments; }
}
