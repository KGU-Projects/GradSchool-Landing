package com.gradschool.post;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {
    @Query("""
        select p from Post p
        where (:category is null or p.category = :category)
          and (:q is null or lower(p.title) like lower(concat('%', :q, '%'))
                          or lower(p.content) like lower(concat('%', :q, '%')))
        order by p.pinned desc, p.id desc
        """)
    Page<Post> search(@Param("category") Post.Category category, @Param("q") String q, Pageable pageable);

    @Modifying
    @Query("update Post p set p.viewCount = p.viewCount + 1 where p.id = :id")
    void increaseView(@Param("id") Long id);
}
