# CTSV Portal API Documentation

Reference documentation for upstream university endpoints (`https://ctsv.hust.edu.vn/api-t`).

## Upstream Endpoints

### 1. Assign / Register Activity
- **Endpoint:** `POST https://ctsv.hust.edu.vn/api-t/Activity/AssignUserActivity`
- **Payload:**
  ```json
  {
    "AId": 15528,
    "Reason": "",
    "UserName": "your_student_id",
    "TokenCode": "..."
  }
  ```

### 2. Get Published Activities
- **Endpoint:** `POST https://ctsv.hust.edu.vn/api-t/Activity/GetPublishActivity`
- **Payload:**
  ```json
  {
    "Signature": "sample string 4",
    "NumberRow": 100,
    "PageNumber": 1,
    "UserName": "your_student_id"
  }
  ```

### 3. Get Activity Details By ID
- **Endpoint:** `POST https://ctsv.hust.edu.vn/api-t/Activity/GetActivityById`
- **Payload:**
  ```json
  {
    "AId": 15440,
    "UserName": "your_student_id"
  }
  ```

### 4. Get Criteria Details (Điểm rèn luyện)
- **Endpoint:** `POST https://ctsv.hust.edu.vn/api-t/Criteria/GetCriteriaTypeDetails`
- **Payload:**
  ```json
  {
    "Semester": "2026-1",
    "UserCode": "your_student_id",
    "UserName": "your_student_id",
    "TokenCode": "..."
  }
  ```

---

## Local FastAPI Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Healthcheck & API status |
| `GET` | `/api/users/{username}/activities` | Fetch student activities (cached, with `?refresh=` and `?incomplete_criteria=`) |
| `PUT` | `/api/users/{username}/activities/{activity_id}` | Assign/join activity on CTSV and update local state |
| `GET` | `/api/users/{username}/criteria` | Fetch student DRL evaluation tree and scores |
| `GET` | `/docs` | Interactive Swagger UI |
