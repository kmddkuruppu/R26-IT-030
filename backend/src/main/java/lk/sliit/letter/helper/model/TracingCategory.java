package lk.sliit.letter.helper.model;

// NOTE: if your project is on Spring Boot 2.x, change every "jakarta.persistence"
// import in this file (and TracingLetterData.java) to "javax.persistence".
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * A letter category/group shown in the LetterTracing page sidebar,
 * e.g. "vowels" (ස්වර), "ka" (ක වර්ගය), "ca" (ච වර්ගය) ...
 * Replaces the hard-coded LETTER_CATEGORIES array in LetterTracing.js.
 */
@Entity
@Table(name = "tracing_categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TracingCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // stable machine key, e.g. "vowels", "ka", "ca", "tta", "ta", "pa", "ya", "sha", "lla"
    @Column(nullable = false, unique = true, length = 50)
    private String code;

    // Sinhala display name, e.g. "ස්වර"
    @Column(nullable = false, length = 100)
    private String name;

    // English display name, e.g. "Vowels"
    @Column(name = "name_en", nullable = false, length = 100)
    private String nameEn;

    // controls display order in the sidebar
    @Column(name = "order_index")
    private Integer orderIndex;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TracingLetterData> letters = new ArrayList<>();
}