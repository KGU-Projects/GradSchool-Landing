package com.gradschool.content;

import jakarta.persistence.*;

/** 홈페이지 섹션별 내용(JSON 문자열). key 예: site, hero, intro, research, programs, admission */
@Entity
public class SiteContent {
    @Id @Column(name = "content_key")
    private String key;
    @Column(nullable = false, columnDefinition = "text")
    private String json;

    protected SiteContent() {}
    public SiteContent(String key, String json) { this.key = key; this.json = json; }
    public String getKey() { return key; }
    public String getJson() { return json; }
    public void setJson(String json) { this.json = json; }
}
