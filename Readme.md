# 📘 Student Directory Management System

> **A Hybrid Data Structures & Algorithms (DSA) Project**
> Combining a modern Web UI with a classic C Language CLI using Linked Lists.

![Project Status](https://img.shields.io/badge/Status-Active-success)
![Language](https://img.shields.io/badge/Language-C-blue)
![Frontend](https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JS-orange)

## 🎯 Project Overview

The **Student Directory Management System** is a unique mini-project that bridges the gap between modern web development and traditional computer science concepts. It features a responsive **Web Dashboard** for visual management and a **C Command Line Interface (CLI)** that manages data using **Singly Linked Lists**.

Both interfaces share a common **CSV storage system**, allowing data entered in the browser to be processed by the C program and vice-versa.

### Key Capabilities
* **Dual Interface:** Manage students via Web UI or Terminal.
* **Data Persistence:** Import/Export functionality using CSV.
* **Complex Data Handling:** Supports alphanumeric roll numbers (e.g., `1/24/SET/BCS/145`).
* **Analytics:** Auto-calculates class performance statistics.

---

## 🧩 Features

### ✅ Web Application
* **Modern UI:** Responsive HTML/CSS interface with a clean design.
* **CRUD Operations:** Add, Search, and Delete students.
* **Bulk Actions:** Delete selected rows or export the entire list.
* **Real-time Stats:** Automatic calculation of:
    * Highest, Lowest, and Average CGPA.
    * CGPA Distribution (Bar charts/buckets).
* **Local Execution:** Runs entirely in the browser (No server required).

### ✅ C CLI Program (DSA Implementation)
* **Core DSA:** Implements a **Singly Linked List** from scratch.
* **File I/O:** Loads and Saves to the same CSV format used by the web app.
* **Robust Input:** Handles complex roll number strings (not just integers).
* **Menu-Driven:** Easy-to-use terminal menu for adding, searching, and deleting.

---

## 🏗️ Technologies Used

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3 | Layout and styling of the dashboard. |
| **Logic (Web)** | Vanilla JavaScript | DOM manipulation, CSV parsing, and Math stats. |
| **Backend (CLI)** | C Language | Core application logic. |
| **Data Structure** | Linked List | Dynamic memory management for student records. |
| **Storage** | CSV | Universal data exchange format. |

---

## 🧠 System Design

The system uses a Linked List structure where the `Student` node contains data and a pointer to the next node.

```mermaid
classDiagram
    class Student {
        +string roll
        +string name
        +string dept
        +float cgpa
        +Student* next
    }

    class LinkedList {
        +Student* head
        +insertEnd(Student)
        +search(roll)
        +deleteRoll(roll)
        +displayAll()
        +loadFile(filename)
        +saveFile(filename)
    }

    LinkedList --> Student : contains
    Student --> Student : next

Compile:

Bash

gcc student_cli.c -o student_cli
Run:

Bash

./student_cli students.csv
Menu Options:

Add: Insert a new student into the Linked List.

Search: Find a student by unique Roll Number.

Delete: Remove a node from the Linked List.

Display: Print the current list to the console.

Save: Write the Linked List back to students.csv.

Exit: Close the program.

📌 Why This Project is Unique?
Most DSA projects use simple integer IDs and run only in a black-and-white terminal. This project distinguishes itself by:

Professional UI: Offering a user-friendly frontend.

Interoperability: Proving that C and JavaScript can share data via simple file formats.

Realistic Data: Handling long, complex string-based roll numbers (e.g., 1/24/SET/BCS/145).

Practical Application: Demonstrating how Linked Lists are actually used to manage dynamic lists in software.

📝 Future Enhancements
[ ] Sorting algorithms (Sort by CGPA/Name).

[ ] Edit functionality for existing records.

[ ] Graphical charts (using Chart.js for the Web UI).

[ ] Migration to a SQL database backend.