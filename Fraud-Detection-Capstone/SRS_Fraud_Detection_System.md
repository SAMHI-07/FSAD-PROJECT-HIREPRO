# Software Requirements Specification: Fraud Detection System for Financial Transactions

**Version:** 1.0  
**Date:** May 2026  
**Prepared for:** Internship Capstone Submission

## Project Overview

This project is a machine learning based fraud detection system for financial transactions. It will analyze transaction features, predict whether a transaction is suspicious, assign a fraud probability score, and display fraud alerts through a dashboard.

## Objectives

- Detect high-risk financial transactions using machine learning.
- Provide transaction-level fraud probability and risk category.
- Support manual transaction prediction and batch CSV upload.
- Display fraud trends, alerts, and model performance metrics.
- Use anonymized or synthetic data only.

## Core Features

- Secure login for admin and fraud analyst users.
- Manual transaction prediction form.
- CSV batch upload and prediction results.
- Fraud probability, predicted label, and Low/Medium/High risk classification.
- Dashboard with fraud rate, recent alerts, amount trends, and model metrics.
- Transaction history with review status and analyst notes.

## Suggested Tech Stack

- Frontend: React.js
- Backend: Python Flask or FastAPI
- Machine Learning: pandas, scikit-learn, imbalanced-learn
- Database: SQLite for demo, PostgreSQL for extension
- Visualization: Chart.js, Recharts, or Plotly

## One-Week Development Plan

| Day | Work planned | Deliverable |
| --- | --- | --- |
| Day 1 | Finalize requirements and SRS | Approved SRS |
| Day 2 | Dataset preparation and EDA | Clean training dataset |
| Day 3 | Train and evaluate models | Saved model and metrics |
| Day 4 | Build backend APIs | Working prediction API |
| Day 5 | Build frontend dashboard | Usable web UI |
| Day 6 | Integrate full system | End-to-end demo |
| Day 7 | Testing and documentation | Final submission package |

## Submission Checklist

- SRS document
- Project source code
- README with setup instructions
- Project description
- Screenshots or live demo link
- LinkedIn post sharing the SRS/project
