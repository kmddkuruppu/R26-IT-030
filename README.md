# Letter Helper – Sinhala Handwriting Learning Support System

**Research Project | Group ID: R26-IT-030**

Sri Lanka Institute of Information Technology (SLIIT)  
Faculty of Computing  
2026 Regular Batch

## 1. Project Overview

Letter Helper is an interactive educational web application designed to support Sinhala letter recognition, handwriting practice, and sentence-level learning among primary school children.

The system combines interactive learning activities, handwriting recognition techniques, adaptive learning strategies, and gamification to create an engaging learning environment.

The project consists of four main research components that address different challenges in Sinhala literacy development.

## 2. Research Problem

Traditional Sinhala handwriting learning methods often provide limited opportunities for personalized practice, immediate feedback, and automated evaluation.

Children may experience difficulties in recognizing similar Sinhala letters, following correct writing patterns, constructing sentences, and monitoring their learning progress.

Letter Helper aims to address these challenges through a technology-supported learning environment.

## 3. Research Objectives

The main objectives of this project are:

- To support Sinhala letter recognition through interactive learning activities.
- To recognize handwritten Sinhala letters using deep learning techniques.
- To improve Sinhala letter formation through guided tracing and writing practice.
- To provide personalized learning activities based on individual student performance.
- To improve Sinhala sentence-writing skills through guided and free-writing activities.
- To provide feedback that supports continuous learning and improvement.

## 4. Research Components

### Component 01: Sinhala Letter Recognition

This component helps children identify and recognize Sinhala letters.

**Main Features:**

- Display Sinhala vowels and consonants.
- Provide example words, images, and pronunciation support.
- Allow users to upload handwritten Sinhala letter images.
- Recognize handwritten letters using a Convolutional Neural Network (CNN).
- Display recognition results.
- Identify and reject invalid letter images.

**Research Contribution:**

CNN-based Sinhala handwritten letter recognition integrated into an interactive learning environment.

### Component 02: Letter Tracing and Writing Practice

This component helps children learn correct Sinhala letter formation through interactive tracing.

**Main Features:**

- Interactive Sinhala letter tracing.
- Visual guidance and tracing keypoints.
- Letter boundary validation.
- Stroke-order checking.
- Immediate visual, audio, and vibration feedback.
- Performance-based scoring.
- Adaptive and Static practice modes.

**Research Contribution:**

A performance-based adaptive tracing mechanism that adjusts guidance according to students' recent tracing performance.

### Component 03: Gamified Learning

This component provides interactive educational games to improve Sinhala letter recognition and student engagement.

**Main Features:**

- Interactive Sinhala letter-learning games.
- Letter Hunt activities.
- Performance recording.
- Adaptive letter selection.
- Confusion-aware learning.
- Targeted practice activities.
- Practice mastery evaluation.

#### Sinhala Letter Confusion-Aware Adaptive Learning Engine (SLC-ALE)

SLC-ALE is a rule-based adaptive learning engine integrated into the Letter Hunt game.

It identifies Sinhala letters that students frequently recognize incorrectly or confuse with other letters.

For example, if a child selects ග instead of ක, the system records the confusion and uses previous mistakes to prioritize relevant letters during future practice.

**Core Algorithmic Techniques:**

1. **Mistake-Based Target Selection:** Gives higher selection priority to frequently misidentified target letters.
2. **Confusion-Aware Distractor Selection:** Gives higher priority to letters that students frequently confuse with the target letter.
3. **Weighted Random Selection:** Adjusts letter selection probabilities according to recorded mistake and confusion frequencies.

**Additional Learning Mechanisms:**

- Records student letter-selection attempts.
- Calculates confusion frequencies.
- Identifies frequently confused letter pairs.
- Detects repeated confusion after three incorrect selections of the same letter pair.
- Initiates targeted practice activities.
- Evaluates mastery using three consecutive correct answers.
- Integrates with backend services for saving attempts and practice-session records.

**Research Contribution:**

A confusion-aware adaptive learning approach that personalizes Sinhala letter recognition practice according to individual students' mistakes and confusion patterns.

### Component 04: Practice Sentences and Progress Tracking

This component supports Sinhala sentence-writing practice and learning progress monitoring.

**Main Features:**

- Guided sentence practice.
- Audio-assisted learning.
- Free-writing activities.
- Handwritten Sinhala sentence recognition.
- Basic rule-based grammar checking.
- Sentence practice feedback.
- Sentence management through an administrator interface.

**Research Contribution:**

An integrated sentence-level learning approach combining handwriting recognition, basic grammar checking, and interactive sentence practice.

## 5. Technologies Used

| Layer | Technologies |
|---|---|
| Frontend | React.js, JavaScript, HTML, CSS |
| Backend | Java, Spring Boot |
| Database | Docker MySQL |
| Machine Learning | CNN, CRNN |
| Model Inference | ONNX Runtime |
| API Communication | REST APIs |
| Version Control | Git, GitHub |
| Development Tools | Visual Studio Code, IntelliJ IDEA or other Java IDEs |

## 6. System Architecture

Letter Helper follows a frontend–backend architecture.

**Frontend (React.js)**

Provides the user interface, interactive learning activities, tracing functionality, and game interactions.

**Backend (Spring Boot)**

Handles application services, REST API requests, user-related operations, learning records, and database communication.

**Database (MySQL)**

Stores application information and relevant student learning records.

**Machine Learning Models**

Support handwritten Sinhala letter and sentence recognition.

### General Application Flow

User → React Frontend → Spring Boot REST API → MySQL Database

For handwriting recognition:

Uploaded Handwriting Image → Preprocessing → Recognition Model → Prediction Result → User Interface

## 7. Project Structure

```text
R26-IT-030/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── Components/
│   │   ├── Pages/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       └── resources/
│   └── pom.xml
│
└── README.md
```

## 8. Installation and Setup

### Prerequisites

Install the following software:

- Java Development Kit (JDK 21)
- Apache Maven
- Node.js and npm
- Git
- MySQL access and the required database configuration

### Step 1: Clone the Repository

```bash
git clone https://github.com/kmddkuruppu/R26-IT-030.git
cd R26-IT-030
```

### Step 2: Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Configure the required application properties and environment variables for the database, authentication, SSL, and model resources.

Compile the backend:

```bash
mvn clean compile
```

Start the Spring Boot application:

```bash
mvn spring-boot:run
```

The current development configuration uses HTTPS on port 8080.

### Step 3: Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend application:

```bash
npm start
```

Open the local development URL displayed by the frontend development server.

**Important:** Database credentials, authentication secrets, SSL private keys, and other sensitive configuration values must not be committed to GitHub.

## 9. Adaptive Learning Workflow

The SLC-ALE mechanism follows these main steps:

1. A student participates in the Letter Hunt game.
2. The system records the target letter and selected letter.
3. Incorrect selections are analyzed to identify confusion patterns.
4. Mistake-based and confusion-aware weights are calculated.
5. Weighted random selection prioritizes difficult letters.
6. Repeated confusion triggers targeted practice.
7. Three consecutive correct answers satisfy the practice mastery condition.
8. Learning attempts and practice records are submitted through backend API services.

## 10. Expected Benefits

The Letter Helper system is designed to:

- Improve access to interactive Sinhala literacy learning.
- Support individual learning difficulties.
- Encourage correct letter recognition and handwriting practice.
- Provide immediate and understandable feedback.
- Increase student engagement through gamified activities.
- Support repeated practice of difficult Sinhala letters.
- Provide a foundation for future personalized learning improvements.

## 11. Research Team

**Group ID:** R26-IT-030

**Institution:** Sri Lanka Institute of Information Technology (SLIIT)

**Research Project:** Letter Helper – Sinhala Handwriting Learning Support System

The project is developed collaboratively through four individual research components:

1. Sinhala Letter Recognition
2. Letter Tracing and Writing Practice
3. Gamified Learning
4. Practice Sentences and Progress Tracking

*Add the verified student names, registration numbers, and supervisor details here before final submission.*

## 12. Repository

**GitHub Repository:**  
https://github.com/kmddkuruppu/R26-IT-030

This repository contains the frontend and backend implementation of the Letter Helper research project.

## 13. Conclusion

Letter Helper combines Sinhala handwriting recognition, interactive tracing, adaptive gamified learning, and sentence-level practice within a unified educational platform.

The project aims to support primary school children in developing Sinhala literacy skills through interactive, personalized, and technology-assisted learning activities.
