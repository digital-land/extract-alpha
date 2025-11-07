---
title: Forming the research plan, and extracting trees
description: 
date: 2025-11-07
author: Steve Messer
---

It’s the third week in our alpha phase and it’s been a really busy week, pulling plans together at quite a pace. If you want to catch up on the story so far, go and take a look at [previous weeknotes](/weeknotes/).

Here’s the highlights of what we got up to this week.

## Burning questions

On Monday we prioritised our risky assumptions, identifying the key things we need to learn in order for the product to be a success. We wrote hypothesis statements to [hold together our learning, thinking and making](https://www.dxw.com/2020/02/using-hypotheses-to-hold-together-your-learning-thinking-and-making/), pairing clear outcomes with measures of success. These statements help us know when we’ve validated an assumption, so they’re a core part of the alpha phase. 

Our hypothesis statements took this format:

> **We believe that** [doing this/building this feature/creating this experience] **for** [these people/personas]
> **will achieve** [this outcome]. 
> **We will know this is true when we see** [this market feedback, quantitative measure, or qualitative insight].

We also spent time calling out all our burning questions, the nuance we need to understand in order to design and deliver a product that meets users’ needs. These fell into five groups:

- Their process, and the end-to-end journey
- Accuracy of output and time spent on task
- Ownership of the output
- Incentives to convert documents into data
- Satisfaction with the output

This work is moving into a [knowledge kanban](https://userresearch.blog.gov.uk/2017/02/16/how-a-knowledge-kanban-board-can-help-your-user-research/) to track the progress of our assumptions and learnings. We will continue to map our evolving assumptions, hypothesis and questions as we learn from the upcoming user research.

As Erika Hall reminds us, enthusiasm isn’t a substitute for knowledge. Asking these questions will help us learn about and mitigate the [four big risks](https://www.svpg.com/four-big-risks/) with product and service development.

## End of sprint demo

During the end-of-sprint demo, Jordy showcased a new feature for extracting and identifying individual trees (as points) in Tree Preservation Order documents (TPOs). Previously only capable of handling area-like objects, this was achieved by integrating Gemini AI to recognise and label each tree, even providing details like species. Jordy generalised the method, meaning it can be applied to other point-like objects in future.

![Jordy demonstrates the new TPO feature.](jordy-shares-tpo-feature.png)

Aydin also worked on adding versioning to track and changes that users make to shapes, allowing them to undo and redo changes while they’re refining the output. We expect this will be really useful for users.

Gavin presented innovations in the georeferencing technology he’d developed. The system now performs smarter lookups for addresses, using an LLM to choose the correct address when ambiguity arises, significantly improving accuracy. He also showed improvements to pinpoint locations on maps. It can now more accurately identify and place shapes (polygons) over maps, even in challenging formats like old-style coastal maps.

![Rob shares his research plan and how it came from mapping our assumptions.](rob-shares-research-plan.jpg)

Rob presented his research roadmap for the alpha phase. The roadmap showed how we would produce valuable, robust research outputs within five weeks, leading to an well-defined MVP.

Rob proposed a high-level research timeline with specific focus areas for each week:

- Week 2: Metrics pilot (almost like prototype testing)
- Week 3 and 4: Evaluative studies on user-centred design questions (the burning questions)
- Week 5: Another look at metrics work, incorporating learnings from weeks 3 and 4 (aiming to show an improvement)
- Week 6: Final documentation and handover of next steps

The metrics pilot (and follow-up study) aims to capture baseline data and surface necessary measures or logs for future benchmarking and success metric development. The evaluative studies will assess speed, accuracy, and overall experience using Extract compared to GIS software, with follow-up surveys to gather quantitative and qualitative data.

## A new sprint

The team got together to plan the development of key features ready for testing. Though some of these have been in existence for a while, they were built into an inaccessible frontend. These are being ported over to an Express.js frontend by Kevin and Hannah at great speed, which can utilise the Extract backend.

Fabia also started design research for one of the trickiest features: evaluating the AI’s output alongside the original document, in an accessible way. This falls right in the middle of the user’s journey and will set a core design constraint, helping us eliminate a big uncertainty early on. [Starting in the middle](https://basecamp.com/shapeup/3.2-chapter-11#start-in-the-middle) can help us address design problems early on, making it quicker to design and develop features in successive weeks.

Hannah and Kevin started looking at the who, what, where, when, why and how of frontend development, exploring where code will live, where it will be deployed, and other details. This operating model will pay dividends in coming weeks.

Steve and Owen made a start on one of the assurance tasks, calling out how to meet the principles in the [AI Playbook for the UK Government](https://www.gov.uk/government/publications/ai-playbook-for-the-uk-government/artificial-intelligence-playbook-for-the-uk-government-html), which was mentioned in a [Parliamentary question and answer](https://questions-statements.parliament.uk/written-questions/detail/2025-10-22/84457) last week. 

### Aligning on plans

Aligning two teams to work as one, with complementary methods, is tricky, especially as we’ve been moving at different speeds in the past. There’s a need to refine how [incubating](https://ai.gov.uk/about/#:~:text=and%20government%20priorities.-,Incubating) and [scaling](https://ai.gov.uk/about/#:~:text=wider%20public%20sector.-,Scaling) overlaps with the [alpha](https://www.gov.uk/service-manual/agile-delivery/how-the-alpha-phase-works) and [beta](https://www.gov.uk/service-manual/agile-delivery/how-the-beta-phase-works) phases, so that products and services can meet the [Service Standard](https://www.gov.uk/service-manual/service-standard) and [spend controls](https://www.gov.uk/service-manual/agile-delivery/spend-controls-pipeline-process). 

This is a [common stage of team development](https://hr.mit.edu/learning-topics/teams/articles/stages-development) though and will be beneficial to work through. And we’re all committed to the mission equally, so we’re moving in a common direction. 

## Invitations to join research and testing

Adding to all the progress already made, Friday ended with an achievement as the first invitation to join research and testing went out to a local planning authority! More will be going out early next week, recruiting even more people for research and testing. 

Onwards!