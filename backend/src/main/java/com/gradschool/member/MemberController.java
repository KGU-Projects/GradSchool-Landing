package com.gradschool.member;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
public class MemberController {
    record MemberRequest(@NotBlank String name, @NotNull Member.Role role, String title, String field,
                         String email, String phone, String office, String photoUrl, String bio,
                         String homepage, Integer sortOrder, Boolean visible) {}

    private final MemberRepository repo;
    public MemberController(MemberRepository repo) { this.repo = repo; }

    /** 공개: 노출 설정된 구성원만. 연락처(전화)는 공개 API에서 제외하지 않고 관리자가 입력한 값만 노출된다. */
    @GetMapping("/api/members")
    public List<Member> list() { return repo.findByVisibleTrueOrderBySortOrderAscIdAsc(); }

    @GetMapping("/api/members/{id}")
    public Member get(@PathVariable Long id) {
        return repo.findById(id).filter(Member::isVisible).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/api/admin/members")
    public List<Member> listAll() { return repo.findAll(Sort.by("sortOrder", "id")); }

    @PostMapping("/api/admin/members")
    @ResponseStatus(HttpStatus.CREATED)
    public Member create(@Valid @RequestBody MemberRequest r) { return repo.save(apply(new Member(), r)); }

    @PutMapping("/api/admin/members/{id}")
    public Member update(@PathVariable Long id, @Valid @RequestBody MemberRequest r) {
        return repo.save(apply(repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND)), r));
    }

    @DeleteMapping("/api/admin/members/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { repo.deleteById(id); }

    private Member apply(Member m, MemberRequest r) {
        m.setName(r.name()); m.setRole(r.role()); m.setTitle(r.title()); m.setField(r.field());
        m.setEmail(r.email()); m.setPhone(r.phone()); m.setOffice(r.office()); m.setPhotoUrl(r.photoUrl());
        m.setBio(r.bio()); m.setHomepage(r.homepage());
        m.setSortOrder(r.sortOrder() == null ? 0 : r.sortOrder());
        m.setVisible(r.visible() == null || r.visible());
        return m;
    }
}
