
Problem Statement
❗ The Problem
Rwanda’s current land administration processes—covering land registration, transfers, taxation, construction permits, dispute resolution, and related services—are often manual, fragmented, and paper-based. This causes a range of issues for both citizens and government institutions:

For Citizens and Landowners
Delayed services: Registering land, transferring ownership, or getting construction permits can take weeks due to in-person visits and paperwork.

Unclear processes: Many are unsure how to initiate services like registering a property or applying for a permit.

Lack of transparency: It's difficult to track the status of land requests, leading to frustration, misinformation, or even corruption.

Disputes and fraud: Weak verification processes and overlapping claims lead to avoidable land conflicts.

For Government and Administrative Staff
No centralized system: Land information is scattered across local offices, making it hard to coordinate and verify data.

Manual records: Reliance on physical files increases the risk of loss, forgery, or outdated information.

Slow inspections and permit processing: Urban planning departments are overburdened, lacking the tools to manage growing volumes of requests.

Limited oversight: There’s minimal visibility into who approved what, when, or why—hindering accountability.

Challenge
Create a simple web application that allows citizens to authenticate, register, and transfer land. The solution should be scalable, visual appealing, and maintainable, keeping in mind that this will eventually be part of a larger project we are about to start soon.



🔹 1. Land Registration UI
Role: Citizen
Page: /my-land

Form to register land: parcel ID, address, land size, ownership type

Upload proof of ownership (PDF/image)

Status progress view (Pending → Under Review → Approved)

List view of previously submitted applications

Use toast for success/error

🔹 2. Land Transfer UI
Role: Citizen & Notary
Page: /transfers

Allow user to initiate a transfer:  Fill in  recipient_id, attach contract, and parcel_id.

View list transfers 

Update transfer

Create a transfer

Delete a transfer

Use modals for transfer confirmation

Constraints:
You have only one and a half days ( This Sunday and Mid-Monday) to produce a working solution.

Use the provided Supabase client strictly for insertion and retrieval operations. Supabase should not handle any other functionality.

Employ proper global state management without using local storage.

[BONUS] Implement unit tests for any reusable functions or composables that you develop to ensure maintainability and reliability.

Superbase credentials

Anon(Public) Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzYmVjbnZmbGFvemNha2hqY3BoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjk5Nzg4MCwiZXhwIjoyMDY4NTczODgwfQ.0w4CUKzI1bnJxWfWjxKPIG8_rSfC-6l89YWQwIoMJPI

Service Role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzYmVjbnZmbGFvemNha2hqY3BoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjk5Nzg4MCwiZXhwIjoyMDY4NTczODgwfQ.0w4CUKzI1bnJxWfWjxKPIG8_rSfC-6l89YWQwIoMJPI

Database structure
This is the Supabase database structure. Create the same entities in your Superbase workspace  When doing insertion, read, etc use these field names.

Screenshot 2025-07-20 at 10.15.33.png

Important notes: 
The created_at column on both tables has a default value of now. Feel free to skip it when creating a record.

Development Stack: 
Although the following tools are recommended, you are free to propose superior alternatives if they enhance efficiency or robustness:

UI Framework: Vue 3 with the Composition API and TypeScript

Styling Components: ShadCn Vue library for a robust component ecosystem

CSS Utility: Tailwind CSS for streamlined and highly customizable styling

Form Handling: VeeValidate and Zod for dynamic, schema-driven validations

Data Layer & Real-Time Updates: Tanstack Query (for Vue) to manage data retrieval and caching, combined with Supabase for rapid CRUD operations.

App navigation: Vue router