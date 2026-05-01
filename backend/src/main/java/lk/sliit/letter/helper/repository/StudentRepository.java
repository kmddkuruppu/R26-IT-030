package lk.sliit.letter.helper.repository;

import lk.sliit.letter.helper.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Integer> {
}
