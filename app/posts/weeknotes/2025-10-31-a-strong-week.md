---
title: “A strong week, a solid 9”
description:  
date: 2025-10-31
author: Steve Messer
tags: 
    - MHCLG
    - knowledge sharing
    - architecture diagram
    - user journey
    - assumptions map
    - re-using components
---

As Jenny said, this was a strong week. A solid 9 out of 10.

This is our second weeknote about working on the [alpha phase](https://www.gov.uk/service-manual/agile-delivery/how-the-alpha-phase-works) of Extract. It’s a [regular, weekly communication](https://doingweeknotes.com/) of what we’ve done, what we’re thinking about, ideas, decisions, scrappy thoughts, and stories about our work designing and testing Extract. It’s also how we can remember what we’ve done. Written for us, but shared with you. (Read [last week’s note](/weeknotes/the-unit-of-delivery-is-the-team/) if you’d like to catch up.)

The key theme of the week was knowledge-sharing, living up to the guiding principle of sharing understanding that we [established last week](/weeknotes/the-unit-of-delivery-is-the-team/#guiding-principles). The more a team collectively understands what they’re doing and why, the less they need to debate what happened or why and can quickly move to utilising that learning.

## Assumptions to validate

Monday started with a workshop to finish off mapping our assumptions, which we had started last week. These are the assumptions we’ll be validating or invalidating throughout the alpha, so we’re glad we got those out of our heads early. 

Though this isn’t everything we’ll be exploring, some of our assumptions include the following.

- **The need for efficiency:** there’s a strong assumption that these users desperately need to reduce manual effort in extracting data from planning documents, as they’re currently spending significant time on this task.
- **The need for accuracy and consistency:** users require high accuracy in data extraction; inconsistencies are a major pain point.
- **Integration with existing systems:** there’s an implied need for the system to potentially integrate with existing planning systems – though this isn’t fully fleshed out yet.
- **PDF is the dominant format:** though we know that some local planning authorities have TIFF files of scanned documents, PDFs are more popular.

Each of these assumptions has an impact on the functionality and user experience of Extract, hence why we’re testing out different options during the alpha phase.

## Re-using code from other parts of government

Make things open, it makes things better. That’s a [government design principle](https://www.gov.uk/guidance/government-design-principles#make-things-open-it-makes-things-better) that encourages us to share code, share learnings, and makes it possible to get a head start by re-using other people’s work.

Fabia, Hannah and Kevin have been looking at the [map components we can borrow from HM Land Registry and Environment Agency](https://github.com/alphagov/govuk-design-system/discussions/4531#discussioncomment-13887453), rather than building our own. They’ve done some great work over the years, especially on the accessibility of maps, and we’re keen to share back anything we learn too – returning the favour. 

![HM Land Registry’s map component includes features our users will find useful, like editing a shape on a map. This screenshot shows their map component displaying a London street map. A sidebar offers options to search by address, draw areas, and edit the map’s features.](edit-shape-on-map.png)

![HM Land Registry’s map component also includes accessibility features, like navigating a map with a keyboard rather than the mouse. ](keyboard-navigation-on-a-map.png)

The team started documenting where we might re-use these tools in the user journey of Extract, so we can hit the ground running when we do more prototyping.

## Scribbles, diagrams, flows

Wednesday was a busy day, but our best collaboration session yet. Jenny, Chanelle and Fabia came down to London from Manchester, and Gavin, Gordon and Kevin left the Whitechapel Building to head over to 2 Marsham Street, the MHCLG offices. We camped out at the team table all day to work through a packed agenda.

To kick things off, Owen introduced the technical stack of planning.data.gov.uk to the team. There were lots of similarities in approaches, which was really good to hear. Though the current prototype of Extract is built in Next.js, the team agreed that porting it over to an Express.js app now would reap rewards in the near future, helping with quicker prototyping. 

Throughout the meeting, the team members shared their expertise and experiences, aiming to align on the product’s architecture, and deployment strategies. This collaborative discussion is essential in the early stages of forming a team to build a digital product, as it fosters understanding, consensus, and efficient division of tasks among team members.

![Gav draws a diagram of Extract’s current architecture on a whiteboard, while Jenny shares a framework for keeping track of success criteria on another whiteboard.](team-in-the-office-october.jpg)

Next up, Fabia gave everyone a run-through of the user journey she’d been drafting. It’s an early idea – and obviously not validated with users yet – but sharing feature ideas and early thinking on the user experience is always good. 

We talked about bulk uploads, per-document processing, how users would refine the outputted data, the need to undo and redo actions, how to keep data linked up with documents, human-in-the-loop versus human-over-the-loop, accessibility challenges and pre-existing workflows.

Steve and Jenny also scoped out the plan for research and testing, optimising it for our time-poor colleagues in local planning authorities. They’re stretched and we want to make best use of the time they kindly offer us. 

It was a great day and we got a heck of a lot done. 

## Welcoming a user researcher

Our user researcher, Rob, joined us on Thursday, and Steve spent the afternoon onboarding him. That means stuffing his head with lots of context, the programme’s mission, our strategy, and how Extract will play a part.

On Friday, Rob, Fabia, Jenny and Steve shared ideas for the first round of research, which we’ll be able to start planning. If you’re from a local planning authority and you’ve contacted us about being involved, we’ll be getting messages out very shortly!

## Looking at red-line boundaries

Steve visited West Oxfordshire District Council way back in August, and despite taking lots of videos and detailing processes and hearing about pain points, one thing he didn’t manage to document was what happens when a new planning application arrives.

Arthur and Sean demonstrated how they use Uniform and ArcGIS Pro to get red-line boundaries into their back-office systems. It was helpful not only to see the process but also to see which tools were available to the team already. It’s all valuable context which can highlight where Extract can be most useful for local planning authorities. 

## Next week

Next week, we’ll be

- prioritising risky assumptions
- writing hypothesis statements based on those assumptions 
- planning the first round of research, and
- recruiting research participants.

[Subscribe to the feed](/weeknotes/feed.xml) if you’d like to follow along, or check back here next week. 