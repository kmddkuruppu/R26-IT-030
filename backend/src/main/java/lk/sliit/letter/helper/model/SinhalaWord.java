package lk.sliit.letter.helper.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sinhala_words")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SinhalaWord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String word;

//    @Column(nullable = false, length = 100)
//    private String meaning;

    // Syllables stored as comma-separated: "අ,ම්,මා"
    @Column(nullable = false, columnDefinition = "VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String syllables;

    // Path to uploaded image, e.g. "/uploads/words/xxxxx.jpg"
    @Column(nullable = false, columnDefinition = "VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String imageUrl;
}