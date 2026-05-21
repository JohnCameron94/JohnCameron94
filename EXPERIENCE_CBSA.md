# 🍁 Canada Border Services Agency (CBSA)
### Software Engineer / Technical Lead | Ottawa, ON
**October 2018 – February 2023**

---

> Working at CBSA meant writing software that directly contributes to the security and integrity of Canada's borders, with a focus on commercial trade and import/export operations. Every line of code had real-world implications — from processing commercial declarations to enabling trade compliance and client communication systems. This role shaped me into a well-rounded engineer who understands how to build, scale, and maintain enterprise-grade systems under strict compliance and security requirements.

---

## 🧰 Technology Stack

| Category | Technologies |
|----------|-------------|
| **Languages** | Java 8, JEE, Typescript, Javascript, Python |
| **Frameworks** | Spring Boot, Hibernate, JSF |
| **Cloud** | AWS Serverless, AWS CDK, CodePipeline, CodeBuild, CodeDeploy |
| **Databases** | DynamoDB, MySQL, DB2 |
| **Messaging** | Solace PubSub+, IoT Messaging |
| **DevOps** | Jenkins, Azure DevOps, JIRA |
| **Testing** | JUnit, Jest (TDD) |

---

## 📁 Key Project Areas

---

### 🛃 Commercial Import/Export Processing Systems

Enterprise-scale Java applications used by CBSA officers and administrators to manage the end-to-end lifecycle of commercial import and export declarations. These systems play a critical role in risk assessment, duty/tax calculations, compliance verification, and enforcement workflows for commercial trade operations across Canadian ports of entry.

#### 🔍 Overview
These platforms serve as centralized systems for processing and managing commercial customs declarations, enabling officers to review, flag, and act on incoming commercial goods data. The systems integrate with multiple downstream enforcement and risk assessment tools, providing unified interfaces for CBSA trade operations.

#### 💡 Key Contributions
- **Maintained and enhanced** the core Java (Spring Boot, Hibernate, JEE) application powering customs declaration workflows across national ports of entry.
- **Led major release cycles** — coordinated impact analysis, deployment windows, and post-release monitoring to ensure zero service disruption.
- **Optimized legacy business logic** reducing processing latency for high-throughput declaration batches during peak border crossing periods.
- **Implemented CI/CD pipeline** using AWS CodePipeline, CodeBuild, and CodeDeploy to automate testing and deployment, reducing manual release effort by a significant margin.
- **Migrated infrastructure** components to AWS using the Cloud Development Kit (CDK), improving scalability and reducing operational overhead.
- **Authored and maintained** technical documentation to support onboarding and cross-team knowledge sharing.
- **Leveraged TDD (JUnit)** to catch defects early and ensure high confidence in critical business logic changes.

#### 🏗️ Architecture Highlights
- **Publish/Subscribe model** for real-time declaration event streaming across integrated CBSA systems.
- **DB2 & MySQL** relational data stores for structured transactional data.
- **Spring Boot + Hibernate ORM** for clean, maintainable data access layers.

---

### 🚢 External Client Communication System

A government-grade system supporting CBSA's mandate to facilitate communication between CBSA and external commercial clients, including importers, exporters, customs brokers, and trade compliance stakeholders. The application enables efficient information exchange, status updates, and collaborative workflows for commercial trade operations.

#### 🔍 Overview
This system enables compliance officers and analysts to communicate with commercial clients, manage inquiries, provide status updates on commercial declarations, and coordinate resolution of trade compliance matters. The system integrates with internal CBSA enforcement and processing systems to provide seamless communication workflows.

#### 💡 Key Contributions
- **Maintained and extended** the Java (JEE, JSF) frontend and backend components, adapting to evolving client communication requirements and business process changes.
- **Supported 24-hour production rotation** — directly interfacing with internal stakeholders and external commercial clients to resolve critical communication and processing incidents in a timely manner.
- **Implemented new workflow enhancements** to streamline client communication processes and improve service delivery to the commercial trade community.
- **Collaborated with senior architects** to perform impact analysis before releases involving client-facing modules.
- **Integrated Python automation packages** to support team-wide code reuse and streamline batch communication tasks.
- **Participated in code reviews and mentored junior developers** on secure coding practices and government compliance standards.

#### 🏗️ Architecture Highlights
- **JSF (JavaServer Faces)** for the officer and client communication web interface.
- **Spring + Hibernate** data layer with **DB2** as the primary relational store.
- **Publish/Subscribe integration** for real-time notification of communication events to downstream processing systems.

---

### 🔒 Secure Corridor

**Secure Corridor** is a mission-critical CBSA initiative designed to facilitate the secure, streamlined movement of pre-approved, low-risk travellers and commercial shipments across the Canada–US border. The program underpins trusted traveller and trusted shipper pathways, reducing wait times at ports of entry while maintaining the highest levels of security integrity.

#### 🔍 Overview
The Secure Corridor platform integrates with border infrastructure, biometric verification systems, and law enforcement databases to provide real-time risk assessments for enrolled participants. The system enables officers to make rapid, data-driven decisions — ensuring that legitimate border crossings are processed efficiently while suspicious activity is flagged for deeper inspection.

#### 💡 Key Contributions
- **Architected and implemented IoT messaging services** using **Solace PubSub+**, enabling real-time event-driven communication between border sensors, kiosks, and backend enforcement systems.
- **Designed and deployed AWS Serverless architecture** (Lambda, API Gateway, DynamoDB) to support scalable, event-driven workflows for traveller and shipment data processing.
- **Built real-time data pipelines** using AWS Kinesis and SQS for ingesting and processing high-volume border event streams.
- **Implemented infrastructure-as-code** using AWS CDK (Python/Typescript), enabling reproducible, auditable deployments across environments.
- **Led team expansion efforts** — participated in technical interviews and onboarding of new engineers joining the Secure Corridor delivery team.
- **Facilitated Scrum ceremonies** — Sprint planning, retrospectives, and daily standups as Technical Lead.
- **Collaborated across government teams** to align on security requirements, data sharing agreements, and compliance obligations.

#### 🏗️ Architecture Highlights
- **AWS Serverless** (Lambda, API Gateway, SQS, Kinesis, DynamoDB) for event-driven border processing.
- **Solace PubSub+ MQTT broker** for IoT device messaging across border infrastructure.
- **AWS CDK** (Infrastructure as Code) for consistent, repeatable environment provisioning.
- **Python** packages and utilities for shared team tooling and automation.

---

## 🏆 Overall Accomplishments at CBSA

- 🗂️ **Maintained 8 major Java enterprise applications** simultaneously across Spring Boot, Hibernate, JEE, and Pub/Sub architectures.
- 🚀 **Led multiple major release cycles** with full impact analysis, coordinated across cross-functional teams.
- 🏗️ **Implemented full CI/CD pipelines** using AWS CodePipeline, CodeBuild, and CodeDeploy.
- ☁️ **Deployed cloud infrastructure** using AWS CDK across multiple environments.
- 🧪 **Championed TDD** across the team using JUnit and Jest.
- 👥 **Mentored developers**, conducted code reviews, and participated in technical hiring panels.
- 🔄 **Participated in 24/7 on-call production support** with direct client communication.
- 🐍 **Developed reusable Python packages** to standardize tooling and reduce duplication across team projects.
- 📋 **Led and participated in Agile ceremonies** — Scrum, Sprint planning, and retrospectives.
