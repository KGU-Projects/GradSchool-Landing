package com.gradschool.post;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Comment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) private Post post;
    @Column(nullable = false) private String author;
    @Column(nullable = false) private String passwordHash;
    @Column(nullable = false, length = 1000) private String content;
    @Column(nullable = false) private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public Post getPost() { return post; }
    public void setPost(Post v) { post = v; }
    public String getAuthor() { return author; }
    public void setAuthor(String v) { author = v; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String v) { passwordHash = v; }
    public String getContent() { return content; }
    public void setContent(String v) { content = v; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
