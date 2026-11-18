package com.gradschool.content;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;

@RestController
public class UploadController {
    private static final Map<String, String> TYPES = Map.of(
            "jpg", "image/jpeg", "jpeg", "image/jpeg", "png", "image/png", "webp", "image/webp", "gif", "image/gif");
    private final UploadedFileRepository repo;

    public UploadController(UploadedFileRepository repo) { this.repo = repo; }

    @PostMapping("/api/admin/uploads")
    public Map<String, String> upload(@RequestParam("file") MultipartFile file) throws IOException {
        String orig = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        String ext = orig.contains(".") ? orig.substring(orig.lastIndexOf('.') + 1).toLowerCase() : "";
        String type = TYPES.get(ext);
        if (type == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미지 파일(jpg, png, webp, gif)만 업로드할 수 있습니다.");
        String id = UUID.randomUUID().toString();
        repo.save(new UploadedFile(id, type, file.getBytes()));
        return Map.of("url", "/uploads/" + id);
    }

    @GetMapping("/uploads/{id}")
    public ResponseEntity<byte[]> get(@PathVariable String id) {
        // 과거 "uuid.ext" 형태 URL 호환
        String key = id.contains(".") ? id.substring(0, id.lastIndexOf('.')) : id;
        UploadedFile f = repo.findById(key).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(f.getContentType()))
                .cacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable())
                .body(f.getData());
    }
}
