package com.gradschool.content;

import com.gradschool.config.AppProperties;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
public class UploadController {
    private static final Set<String> EXT = Set.of("jpg", "jpeg", "png", "webp", "gif");
    private final Path dir;

    public UploadController(AppProperties p) { this.dir = Path.of(p.uploadDir()).toAbsolutePath(); }

    @PostMapping("/api/admin/uploads")
    public Map<String, String> upload(@RequestParam("file") MultipartFile file) throws IOException {
        String orig = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        String ext = orig.contains(".") ? orig.substring(orig.lastIndexOf('.') + 1).toLowerCase() : "";
        if (!EXT.contains(ext)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미지 파일(jpg, png, webp, gif)만 업로드할 수 있습니다.");
        Files.createDirectories(dir);
        String name = UUID.randomUUID() + "." + ext;
        file.transferTo(dir.resolve(name));
        return Map.of("url", "/uploads/" + name);
    }
}
