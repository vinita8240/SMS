# Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    ADMIN_ROLE ||--o{ ADMIN : "assigned"
    DEPARTMENT ||--o{ DESIGNATION : "contains"
    DEPARTMENT ||--o{ TEACHER : "employs"
    DESIGNATION ||--o{ TEACHER : "titles"
    BANK ||--o{ TEACHER : "payroll"
    TEACHER ||--o{ LEAVE : "applies"
    
    CLASS ||--o{ SECTION : "divided into"
    CLASS ||--o{ SUBJECT : "teaches"
    TEACHER ||--o{ CLASS : "manages"
    TEACHER ||--o{ SECTION : "manages"
    TEACHER ||--o{ SUBJECT : "instructs"
    
    PARENT ||--o{ STUDENT : "guardian of"
    CLASS ||--o{ STUDENT : "enrolled in"
    SECTION ||--o{ STUDENT : "assigned to"
    HOUSE ||--o{ STUDENT : "member of"
    CLUB ||--o{ STUDENT : "participates in"
    DORMITORY ||--o{ STUDENT : "accommodates"
    TRANSPORT ||--o{ STUDENT : "transports"
    
    STUDENT ||--o{ ATTENDANCE : "marked"
    CLASS ||--o{ ATTENDANCE : "grouped"
    
    EXAM ||--o{ MARK : "evaluated in"
    STUDENT ||--o{ MARK : "scores"
    SUBJECT ||--o{ MARK : "graded for"
    EXAM ||--o{ EXAM_QUESTION : "contains"
    
    STUDENT ||--o{ INVOICE : "billed to"
    INVOICE ||--o{ PAYMENT : "settled with"
    EXPENSE_CATEGORY ||--o{ EXPENSES : "categorized as"
    
    BOOK_CATEGORY ||--o{ BOOK : "categorized"
    BOOK ||--o{ LIBRARY_ISSUES : "borrowed in"
    STUDENT ||--o{ LIBRARY_ISSUES : "borrows"
    
    HOSTEL_CATEGORY ||--o{ HOSTEL_ROOM : "classifies"
    HOSTEL_ROOM ||--o{ DORMITORY : "contains"
    
    TRANSPORT_ROUTE ||--o{ TRANSPORT : "mapped"
    VEHICLE ||--o{ TRANSPORT : "serviced by"
```
