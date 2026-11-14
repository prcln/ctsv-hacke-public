"""
Constants and static mappings for CTSV criteria, categories, and API endpoints.
Supports both legacy (2024-2025) and updated (2026+) semester criteria.
"""

# External CTSV Portal API URLs
CTSV_BASE_URL = "https://ctsv.hust.edu.vn/api-t"
ASSIGN_ACTIVITY_URL = f"{CTSV_BASE_URL}/Activity/AssignUserActivity"
GET_PUBLISH_ACTIVITY_URL = f"{CTSV_BASE_URL}/Activity/GetPublishActivity"
GET_ACTIVITY_BY_ID_URL = f"{CTSV_BASE_URL}/Activity/GetActivityById"
GET_CRITERIA_TYPE_DETAILS_URL = f"{CTSV_BASE_URL}/Criteria/GetCriteriaTypeDetails"
DEFAULT_SIGNATURE = "sample string 4"

# User Participation Status in CTSV
class UserActivityStatus:
    NOT_JOINED = -1
    PENDING_OR_JOINED = 1
    COMPLETED = 2

# Mapping from internal criteria keys to official Vietnamese descriptions
CRITERIA_MAP: dict[str, str] = {
    # =========================================================================
    # 1. TIÊU CHÍ CẬP NHẬT MỚI (Năm học 2026-1 trở đi)
    # =========================================================================

    # --- Phần 1: Chấp hành pháp luật và nội quy, quy chế nhà trường ---
    "law_compliance": "Hiểu biết và chấp hành pháp luật của Nhà nước, quy định của nhà trường và nơi cư trú",
    "civic_activity": "Tham gia Sinh hoạt công dân do nhà trường tổ chức",
    "residence_declaration": "Khai báo thông tin liên lạc và nơi cư trú theo yêu cầu của Đại học",
    "class_meeting_2026": "Tham gia Họp lớp thường kỳ do Trường/Khoa tổ chức",
    "rules_knowledge_2026": "Nắm vững quy định và quy chế của nhà trường",
    "commitment_goal": "Hoàn thành mục tiêu cam kết học tập và rèn luyện (Kết quả GPA và điểm rèn luyện cuối kỳ đạt từ mức đăng ký đầu kỳ trở lên)",

    # --- Phần 2: Trách nhiệm, tinh thần và thái độ trong học tập ---
    "study_plan": "Có kế hoạch học tập và rèn luyện phù hợp được thầy cô ghi nhận",
    "academic_event": "Tham gia hoạt động, sự kiện liên quan đến NCKH, học thuật, chuyên môn",
    "study_counseling": "Tham gia các buổi tư vấn xây dựng kế hoạch, động lực học tập phù hợp",
    "career_orientation": "Tham gia hoạt động hướng nghiệp, tìm kiếm thông tin việc làm",
    "professional_training": "Tham gia khóa đào tạo kỹ năng nghề nghiệp, kỹ năng bổ trợ chuyên môn",
    "portfolio_update": "Chủ động xây dựng, hoàn thiện và cập nhật Portfolio cá nhân theo từng học kỳ.",
    "academic_publication_2026": "Tham gia công bố khoa học tại Hội nghị hoặc tạp chí khoa học chuyên ngành",
    "academic_club_2026": "Thành viên CLB học thuật, Lab nghiên cứu, nhóm nghiên cứu, nhóm khởi nghiệp",
    "academic_effort_32": "Có nỗ lực trong học tập (GPA kỳ đánh giá cao hơn kỳ trước, giảm mức cảnh báo học tập, hoặc duy trì điểm GPA trên 3.2).",
    "foreign_lang_skill": "Tham gia các hoạt động tăng cường kỹ năng sử dụng ngoại ngữ được nhà trường ghi nhận",
    "foreign_lang_toeic_600_2026": "Có chứng chỉ ngoại ngữ quốc tế hoặc tương đương đạt mức TOEIC 600 điểm trở lên (còn hạn)",
    "internship_30_days": "Được doanh nghiệp tuyển dụng là thực tập sinh và có thời gian thực tập hơn 30 ngày",
    "olympic_competition": "Tham gia các cuộc thi Olympic cấp Đại học, cấp quốc gia, quốc tế",

    # --- Phần 3: Hoạt động chính trị - xã hội, văn hóa, văn nghệ, thể thao, phòng chống tệ nạn ---
    "political_social_event_2026": "Tham gia sự kiện chính trị - xã hội (các Đại hội, Hội nghị, cuộc họp của tổ chức Đảng, Đoàn - Hội từ cấp Chi bộ, Chi đoàn, Chi hội trở lên... và các chương trình mang tính chính trị - xã hội khác).",
    "cheerleading": "Tham gia cổ vũ các hoạt động phong trào văn hóa, thể thao",
    "health_fitness": "Tham gia các hoạt động thể dục nâng cao sức khỏe được tổ chức bởi các đơn vị hợp pháp",
    "cultural_performance_2026": "Tham gia các cuộc thi văn hóa, văn nghệ do các tổ chức, đơn vị hợp pháp tổ chức (hát, múa, nhảy, nhạc cụ, hội họa...).",
    "sports_competition_2026": "Tham gia các giải thể thao do các tổ chức, đơn vị hợp pháp tổ chức (các môn thể thao chính thức như: chạy, bóng đá, cờ vua, bóng chuyền...).",
    "soft_skills_training_2026": "Tham gia các khóa đào tạo kỹ năng mềm do các đơn vị được Nhà trường công nhận tổ chức.",
    "extracurricular_club": "Thành viên CLB/Tổ/Đội/Nhóm SV hợp pháp, hoạt động về văn nghệ, thể thao, tình nguyện, sở thích",
    "volunteer_activity_2026": "Tham gia các hoạt động tình nguyện (hỗ trợ địa phương, bảo đảm an toàn giao thông khu vực cổng trường, hỗ trợ tổ chức các chương trình và sự kiện của Đại học/Trường/Khoa).",
    "charity_tea_2026": "Tham gia phong trào \"cốc trà đá vì cộng đồng\", \"tuổi trẻ Bách khoa Nhân ái\"",
    "blood_donation_2026": "Tham gia hiến máu nhân đạo do Đại học và các tổ chức hợp pháp phát động, tổ chức",
    "volunteer_team_2026": "Tham gia các đội hình hoặc chiến dịch tình nguyện trong và ngoài Nhà trường (Mùa hè xanh, Tình nguyện mùa đông, Tiếp sức mùa thi, Tư vấn viên đồng đẳng...)",
    "environment_civilization": "Tham gia bảo vệ cảnh quan, môi trường, nếp sống văn minh nơi công cộng.",
    "school_security": "Tham gia các hoạt động đảm bảo an ninh, trật tự và an toàn trường học.",
    "student_forum_policy": "Tham gia các diễn đàn sinh viên, các buổi toạ đàm xây dựng quy định, quy chế và pháp luật",
    "cultural_heritage": "Tham gia các hoạt động phổ biến, tìm hiểu bản sắc văn hóa dân tộc, văn hóa địa phương, văn hóa trường học,…",
    "survey_participation": "Tham gia hoạt động khảo sát thông tin do Đại học thực hiện",

    # --- Phần 4: Điểm ý thức công dân trong quan hệ cộng đồng ---
    "positive_online_action_2026": "Có hành động tích cực trên không gian mạng, phù hợp với chủ trương của Đại học và đường lối, chính sách của Nhà nước.",
    "policy_propaganda_2026": "Tham gia tuyên truyền đường lối của Đảng, pháp luật của Nhà nước, quy định của nơi cư trú hoặc quy chế của Đại học được các cấp có thẩm quyền xác nhận.",
    "policy_dissemination": "Tham gia các hoạt động phổ biến chủ chương của Đảng, chính sách, pháp luật của Nhà nước",
    "history_culture_contest": "Tham gia các cuộc thi tìm hiểu lịch sử, văn hóa, truyền thống dân tộc",
    "hust_image_promotion": "Góp phần xây dựng tốt hình ảnh sinh viên Bách khoa với các cơ quan, tổ chức hay doanh nghiệp được Đại học ghi nhận",
    "merit_certificate_2026": "Được giấy khen, bằng khen của tổ chức Đoàn, Hội, Đại học hoặc chính quyền địa phương",
    "party_awareness_class_2026": "Đạt loại Khá trở lên khi tham gia học \"Lớp bồi dưỡng nhận thức về Đảng\".",
    "party_admission_2026": "Được kết nạp Đảng hoặc được chuyển Đảng chính thức.",
    "internship_performance": "Được cơ quan, công ty hoặc tổ chức hợp pháp nơi thực tập đánh giá hoàn thành tốt nhiệm vụ trở lên",

    # --- Phần 5: Công tác cán bộ lớp, đoàn thể & thành tích xuất sắc ---
    "cadre_excellent_2026": "Cán bộ Lớp, Chi bộ, Đoàn - Hội, Tổ/Đội/CLB, trưởng nhóm SV NCKH hoàn thành xuất sắc nhiệm vụ trong kỳ.",
    "cadre_good_2026": "Cán bộ Lớp, Chi bộ, Đoàn - Hội, Tổ/Đội/CLB, trưởng nhóm SV NCKH hoàn thành tốt nhiệm vụ trong kỳ.",
    "cadre_fair_2026": "Cán bộ Lớp, Chi bộ, Đoàn - Hội, Tổ/Đội/CLB, trưởng nhóm SV NCKH hoàn thành nhiệm vụ trong kỳ.",
    "activity_support_active": "Thành viên tích cực thuộc các Tổ/Đội/CLB, nhóm SV NCKH tham gia hỗ trợ triển khai hoạt động của Lớp, Khoa, Trường hoặc Đại học.",
    "activity_support_good": "Tham gia hỗ trợ triển khai hoạt động của Lớp, Khoa, Trường hoặc Đại học và hoàn thành tốt nhiệm vụ được giao.",
    "activity_support_fair": "Tham gia hỗ trợ triển khai hoạt động của Lớp, Khoa, Trường hoặc Đại học và hoàn thành nhiệm vụ được giao.",
    "prize_national_intl": "Đạt giải trong các cuộc thi chính thức cấp Quốc gia, cấp Quốc tế.",
    "prize_city": "Đạt giải trong các cuộc thi chính thức cấp Thành phố,",
    "prize_university": "Đạt giải trong các cuộc thi chính thức cấp Đại học",
    "ministry_medal_2026": "Được khen thưởng bằng khen, huy chương tương đương cấp Bộ trở lên",
    "research_competition_prize": "Đạt thành tích trong NCKH sinh viên, cuộc thi khoa học kỹ thuật, sáng kiến cải tiến kỹ thuật khởi nghiệp do đơn vị Đại học/Trường/Khoa tổ chức",
    "student_of_5_merits_2026": "Đạt danh hiệu \"Sinh viên 5 tốt\" từ cấp Đại học trở lên",
    "gpa_rl_excellent": "Có kết quả học tập và rèn luyện kỳ trước đó đạt mức xuất sắc (GPA ≥ 3.6, RL ≥ 90) trở lên.",
    "gpa_rl_good": "Có kết quả học tập và rèn luyện kỳ trước đó đạt mức Giỏi (GPA ≥ 3.2, RL ≥ 80) trở lên.",

    # =========================================================================
    # 2. TIÊU CHÍ CŨ (Hỗ trợ tra cứu các kỳ 2024-1, 2024-2, 2025-1, 2025-2)
    # =========================================================================
    "gpa_excellent": "Có kết quả học tập ở mức  GPA ≥ 3.6",
    "gpa_good": "Có kết quả học tập ở mức: 3.2 ≤ GPA < 3.6",
    "gpa_fair": "Có kết quả học tập ở mức: 2.5 ≤ GPA < 3.2",
    "gpa_average": "Có kết quả học tập ở mức: 2.0 ≤ GPA < 2.5",
    "gpa_poor": "Có kết quả học tập ở mức:  1.5 ≤ GPA < 2.0",
    "academic_effort": "Có nỗ lực trong học tập (GPA kỳ đánh giá cao hơn kỳ trước, giảm mức cảnh cáo học tập, hoặc duy trì điểm GPA trên 3.6 )",
    "foreign_lang_on_track": "Đạt trình độ ngoại ngữ theo tiến độ của chương trình đào tạo",
    "foreign_lang_toeic_600": "Đạt chứng chỉ ngoại ngữ tương đương Toeic 600 điểm trở lên",
    "academic_publication": "Tham gia công bố khoa học tại Hội nghị hoặc tạp chí KH chuyên ngành",
    "academic_club": "Thành viên CLB học thuật, Lab nghiên cứu, Nhóm nghiên cứu, nhóm Khởi nghiệp",
    "class_meeting": "Tham gia Họp lớp thường kỳ do Trường thuộc/Viện/Khoa tổ chức",
    "rules_knowledge": "Nắm vững quy định và quy chế của Nhà trường",
    "internship": "Tham gia thực tập tăng cường năng lực nghề nghiệp tại doanh nghiệp",
    "soft_skills_seminar": "Tham gia hội thảo tăng cường kỹ năng mềm, phương pháp học tập, ý thức học tập, làm việc",
    "current_events_talk": "Tham gia các buổi nói chuyện thời sự, phòng chống tội phạm và tệ nạn xã hội ",
    "soft_skills_training": "Tham gia khóa đào tạo kỹ năng mềm",
    "no_exam_ban": "Không bị cấm thi của tất cả các học phần trong kỳ học",
    "library_self_study": "Có tổng thời gian tự học tại thư viện, phòng tự học, hệ thống học tập trực tuyến ... được các đơn vị ghi nhận tối thiểu 160 giờ/kỳ",
    "cultural_performance": "Tham gia các cuộc thi biểu diễn văn hóa văn nghệ được tổ chức bởi các đơn vị hợp pháp (hát, múa, nhảy, đàn, sáo, vẽ tranh,…).",
    "sports_competition": "Tham gia các giải thể thao được tổ chức bởi các đơn vị hợp pháp (các môn thể thao chính thức như: chạy, bóng đá, cờ vua, bóng chuyền,…).",
    "volunteer_activity": "Tham gia hoạt động tình nguyện (mùa hè xanh, tình nguyện tại chỗ, cổng trường ATGT)",
    "charity_tea": "Tham gia phong trào \"cốc trà đá vì cộng đồng\",\" tuổi trẻ Bách khoa Nhân ái\"",
    "blood_donation": "Tham gia hiến máu nhân đạo do Trường và các tổ chức hợp pháp phát động, tổ chức",
    "student_forum": "Tham gia các diễn đàn sinh viên, các buổi toạ đàm với lãnh đạo Đại học, Trường thuộc/Viện/Khoa",
    "positive_online_action": "Có hành động tích cực trên không gian mạng (hoạt động online) phù hợp với chủ trương của Nhà trường, Nhà nước được tập thể ghi nhận",
    "volunteer_team": "Tham gia Đội tình nguyện hợp pháp trong và ngoài trường, tham gia chiến dịch tình nguyện \"mùa hè xanh\", \"tình nguyện mùa đông\", \"tiếp sức mùa thi\",…",
    "political_social_event": "Tham gia sự kiện chính trị - xã hội (các Đại hội, Hội nghị, cuộc họp của tổ chức Đảng - Đoàn - Hội từ cấp Chi bộ - Chi đoàn - Chi hội trở lên,… và các chương trình mang tính chính trị - xã hội khác)",
    "cadre_excellent": "Cán bộ Tổ/Đội/CLB, Lớp, Đoàn - Hội, Chi bộ hoàn thành xuất sắc nhiệm vụ được tập thể công nhận",
    "cadre_good": "Cán bộ Tổ/Đội/CLB, Lớp, Đoàn - Hội, Chi bộ hoàn thành tốt nhiệm vụ được tập thể công nhận",
    "cadre_fair": "Cán bộ Tổ/Đội/CLB, Lớp, Đoàn - Hội, Chi bộ hoàn thành nhiệm vụ được tập thể công nhận",
    "policy_propaganda": "Tham gia tuyên truyền chủ trương của Đảng, chính sách pháp luật của Nhà nước, quy định của nơi cư trú, quy định và quy chế của nhà trường được địa phương, Nhà trường công nhận",
    "security_environment": "Tham gia giữ gìn an ninh – trật tự, bảo vệ sinh cảnh quan - môi trường, nếp sống văn minh nơi công cộng, quảng bá hình ảnh đẹp của Nhà trường được địa phương, Nhà trường công nhận",
    "merit_certificate": "Được giấy khen, bằng khen của tổ chức Đoàn, Hội, Nhà trường hoặc chính quyền địa phương.",
    "party_awareness_class": "Đạt loại Khá trở lên khi tham gia học \"Lớp bồi dưỡng nhận thức về Đảng\"",
    "party_admission": "Đối tượng Đảng được kết nạp Đảng hoặc Đảng viên dự bị được chuyển Đảng chính thức.",
    "student_of_5_merits": "Đạt danh hiệu Sinh viên năm tốt từ cấp Trường trở lên",
    "ministry_medal": "Nhận bằng khen, huy chương tương đương cấp Bộ trở lên",
    "official_competition_prize": "Đạt giải trong các cuộc thi chính thức cấp Trường, cấp Thành phố, cấp Quốc gia, Quốc tế.",

    # --- Điểm trừ vi phạm (Áp dụng các kỳ cũ) ---
    "penalty_exam_warning": "Vi phạm quy chế thi từ cảnh cáo trở lên",
    "penalty_exam_proxy": "Bị kỷ luật khi thi hộ",
    "penalty_cultural_conduct": "Vi phạm quy tắc ứng xử văn hóa",
    "penalty_school_rules": "Vi phạm các Quy định của Nhà trường, các Quy định của Pháp luật bị lập biên bản, bị ra quyết định xử lý.",
    "penalty_criminal_law": "Vi phạm pháp luật thuộc nhóm tội danh hình sự "
}

# Reverse mapping: Vietnamese title string -> short key
REVERSE_CRITERIA_MAP: dict[str, str] = {v.strip(): k for k, v in CRITERIA_MAP.items()}

# Criteria Groupings (Hỗ trợ phân nhóm danh mục hoạt động)
GROUP_ACADEMIC: set[str] = {
    "gpa_excellent", "gpa_good", "gpa_fair", "gpa_average", "gpa_poor", 
    "academic_effort", "academic_effort_32", "foreign_lang_on_track", "foreign_lang_toeic_600",
    "foreign_lang_toeic_600_2026", "foreign_lang_skill", "academic_event", "academic_publication",
    "academic_publication_2026", "academic_club", "academic_club_2026", "olympic_competition",
    "professional_training", "study_plan", "study_counseling", "portfolio_update", "internship_30_days"
}

GROUP_DISCIPLINE: set[str] = {
    "civic_activity", "class_meeting", "class_meeting_2026", "rules_knowledge", "rules_knowledge_2026",
    "commitment_goal", "internship", "soft_skills_seminar", "current_events_talk", "career_orientation", 
    "soft_skills_training", "soft_skills_training_2026", "no_exam_ban", "library_self_study",
    "school_security", "student_forum_policy", "law_compliance", "residence_declaration"
}

GROUP_EXTRACURRICULAR: set[str] = {
    "cultural_performance", "cultural_performance_2026", "sports_competition", "sports_competition_2026",
    "cultural_heritage", "health_fitness", "cheerleading", "extracurricular_club", 
    "volunteer_activity", "volunteer_activity_2026", "charity_tea", "charity_tea_2026",
    "blood_donation", "blood_donation_2026", "student_forum", "positive_online_action",
    "positive_online_action_2026", "volunteer_team", "volunteer_team_2026", "survey_participation", 
    "political_social_event", "political_social_event_2026", "environment_civilization"
}

GROUP_CITIZENSHIP: set[str] = {
    "law_compliance", "policy_propaganda", "policy_propaganda_2026", "policy_dissemination",
    "residence_declaration", "security_environment", "merit_certificate", "merit_certificate_2026",
    "party_awareness_class", "party_awareness_class_2026", "party_admission", "party_admission_2026",
    "student_of_5_merits", "student_of_5_merits_2026", "ministry_medal", "ministry_medal_2026", 
    "official_competition_prize", "history_culture_contest", "hust_image_promotion", "internship_performance"
}

GROUP_LEADERSHIP: set[str] = {
    "cadre_excellent", "cadre_excellent_2026", "cadre_good", "cadre_good_2026", "cadre_fair", "cadre_fair_2026",
    "activity_support_active", "activity_support_good", "activity_support_fair",
    "prize_national_intl", "prize_city", "prize_university", "research_competition_prize",
    "gpa_rl_excellent", "gpa_rl_good"
}

GROUP_PENALTY: set[str] = {
    "penalty_exam_warning", "penalty_exam_proxy", "penalty_cultural_conduct", 
    "penalty_school_rules", "penalty_criminal_law"
}
