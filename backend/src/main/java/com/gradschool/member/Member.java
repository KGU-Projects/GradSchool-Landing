package com.gradschool.member;

import jakarta.persistence.*;

@Entity
public class Member {
    public enum Role { PROFESSOR, PHD, MASTER, ALUMNI }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String name;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private Role role;
    private String title;          // 직위 (교수, 부교수 등)
    private String field;          // 전공/연구 분야
    private String email;
    private String phone;
    private String office;         // 연구실 위치
    private String photoUrl;
    @Column(length = 2000) private String bio;
    private String homepage;
    private int sortOrder;
    private boolean visible = true;

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String v) { name = v; }
    public Role getRole() { return role; }
    public void setRole(Role v) { role = v; }
    public String getTitle() { return title; }
    public void setTitle(String v) { title = v; }
    public String getField() { return field; }
    public void setField(String v) { field = v; }
    public String getEmail() { return email; }
    public void setEmail(String v) { email = v; }
    public String getPhone() { return phone; }
    public void setPhone(String v) { phone = v; }
    public String getOffice() { return office; }
    public void setOffice(String v) { office = v; }
    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String v) { photoUrl = v; }
    public String getBio() { return bio; }
    public void setBio(String v) { bio = v; }
    public String getHomepage() { return homepage; }
    public void setHomepage(String v) { homepage = v; }
    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int v) { sortOrder = v; }
    public boolean isVisible() { return visible; }
    public void setVisible(boolean v) { visible = v; }
}
