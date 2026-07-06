package lk.sliit.letter.helper.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sinhala_letters")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SinhalaLetter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String letter;

    @Column(nullable = false, columnDefinition = "VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String name;

    @Column(nullable = false, length = 20)
    private String sound;

    @Column(nullable = false, columnDefinition = "VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String categoryName;

    @Column(nullable = false, length = 20)
    private String categoryColor;

    @Column(nullable = false)
    private Integer sortOrder;
}