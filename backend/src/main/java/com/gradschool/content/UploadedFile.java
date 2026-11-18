package com.gradschool.content;

import jakarta.persistence.*;

/** 업로드된 이미지(DB 저장). 무료 호스팅처럼 로컬 디스크가 휘발성인 환경을 위해 DB에 보관한다. */
@Entity
public class UploadedFile {
    @Id
    private String id;
    @Column(nullable = false)
    private String contentType;
    @Column(nullable = false, columnDefinition = "bytea")
    private byte[] data;

    protected UploadedFile() {}
    public UploadedFile(String id, String contentType, byte[] data) {
        this.id = id; this.contentType = contentType; this.data = data;
    }
    public String getId() { return id; }
    public String getContentType() { return contentType; }
    public byte[] getData() { return data; }
}
