package com.gradschool.content;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;

@RestController
public class ContentController {
    static final Set<String> KEYS = Set.of("site", "hero", "intro", "research", "programs", "admission");

    private final SiteContentRepository repo;
    private final ObjectMapper om;

    public ContentController(SiteContentRepository repo, ObjectMapper om) { this.repo = repo; this.om = om; }

    /** 저장된 섹션만 {key: value} 로 반환. 없는 섹션은 프론트 기본값을 사용한다. */
    @GetMapping("/api/content")
    public ObjectNode all() throws JsonProcessingException {
        ObjectNode out = om.createObjectNode();
        for (SiteContent c : repo.findAll()) out.set(c.getKey(), om.readTree(c.getJson()));
        return out;
    }

    @PutMapping("/api/admin/content/{key}")
    public JsonNode put(@PathVariable String key, @RequestBody JsonNode body) throws JsonProcessingException {
        if (!KEYS.contains(key)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "알 수 없는 섹션: " + key);
        String json = om.writeValueAsString(body);
        SiteContent c = repo.findById(key).orElseGet(() -> new SiteContent(key, json));
        c.setJson(json);
        repo.save(c);
        return body;
    }

    @DeleteMapping("/api/admin/content/{key}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void reset(@PathVariable String key) { repo.deleteById(key); }
}
