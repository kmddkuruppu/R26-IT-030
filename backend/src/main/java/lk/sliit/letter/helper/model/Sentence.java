package lk.sliit.letter.helper.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "sentences")
public class Sentence {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String sentence;
}
