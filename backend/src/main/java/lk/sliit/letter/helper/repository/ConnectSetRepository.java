package lk.sliit.letter.helper.repository;

import lk.sliit.letter.helper.model.ConnectSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ConnectSetRepository extends JpaRepository<ConnectSet, Long> {
    List<ConnectSet> findAllByOrderBySortOrderAsc();
}