package lk.sliit.letter.helper.controller.dto.response;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AchievementResponse {
    private boolean newAchievementEarned;

    // Kept for backward compatibility — plain codes, e.g. ["master","speed_demon"]
    private List<String> earnedAchievements;

    // NEW — rich info so the frontend can show an icon + bilingual name in
    // the unlock toast without a second API call.
    private List<AchievementDetail> earnedDetails;

    private String message;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AchievementDetail {
        private String code;
        private String titleEn;
        private String titleSi;
        private String descriptionEn;
        private String descriptionSi;
        private String icon;
        private String tier;
    }
}
