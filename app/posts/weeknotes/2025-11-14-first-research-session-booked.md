---
title: First research session booked
description: We’ve reached out to 14 local planning authorities and booked a research session with the first responders. The plans for the first prototype are finalised, and it’s being built ready for testing next week. Plus how to align AI’s actions with user intent.
date: 2025-11-13
author: Steve Messer
---

It’s the fourth week in the alpha and we’ve got the first research and testing session booked in the diary. It’s a win. If you want to catch up on the story so far, go and take a look at [previous weeknotes](/weeknotes/), but here’s what happened this week.

## Recruiting research participants

The week started off by selecting local planning authorities (LPAs) we’d like to do research with. We whittled a list of 31 LPAs down to 14 based on a few criteria:

- The LPA had published less than 5 datasets on planning.data.gov.uk
- The LPA hadn’t yet published datasets for either [Article 4 directions](https://www.planning.data.gov.uk/guidance/specifications/article-4-direction), [conservation areas](https://www.planning.data.gov.uk/guidance/specifications/conservation-area) or [tree preservation orders](https://www.planning.data.gov.uk/guidance/specifications/tree-preservation-order)
- We research with a good mix of rural and urban authorities
- We research with LPAs from regions across England

We’ve contacted LPAs in the following regions: Yorkshire and the Humber, South West, London, West Midlands, East Midlands, East of England, North West, and South East. 

Seven LPAs are urban (according to [rural/urban classifications from Office for National Statistics](https://www.ons.gov.uk/methodology/geography/geographicalproducts/ruralurbanclassifications)), and seven are rural. In some cases, this can have an impact on the number of [tree preservation orders](https://www.gov.uk/guidance/tree-preservation-orders-and-trees-in-conservation-areas) (TPOs) an LPA manages. (Adur & Worthing councils recently shared a [large, delicate TPO map](https://medium.com/awc-digital-design/open-digital-planning-month-5-382ee85b10b6)) in case you’ve not seen one before.)

### First participants recruited!

And the big win of the week was recruiting the first participants! We’re really grateful to LPAs for giving up 1 or 2 hours a week to help us research and test Extract, it’s absolutely essential to ensuring we [start with user needs](https://www.gov.uk/guidance/government-design-principles#start-with-user-needs).

Their Chief Technology Officer asked how Extract works, so they can think about how IT and information security policies might be affected. We’ve written [a note on the technology](/a-note-on-the-technology/) for senior leaders and IT teams who might have this question too.

## Building and deploying the prototype

This week we also finalised the plans for the first prototype, figuring out the who, what, where, when and how. That includes

- what features will be in there
- who’s building those
- where we’re deploying the prototype (and how we’ll use pre-production environments in parallel)
- when we’re having a code-freeze on model improvements
- when we’re deploying the prototype (ahead of the first research session, for testing), and
- how we’re working in phases, building version 0.1 while shaping up features in version 0.2.

We’re borrowing approaches from [dual-track agile](https://dovetail.com/product-development/what-is-dual-track-agile/) which should increase our velocity, helping us make the most use of the limited time we have available. For example, while Hannah is building version 0.1, Fabia and Kevin are exploring accessible shape editing features in fullscreen mode (for version 0.2). (Re-using [HM Land Registry’s map component](https://github.com/LandRegistry/search-local-land-charges-ui) has helped us move quickly here.)

![An example of Kevin’s work on editing shapes from earlier in the week.](editing-shapes-on-maps-video.gif)

Working in these offset phases – or dual tracks – should help us make the most of each other’s strengths. We’ll experiment with the approach and iterate when we need to.

Here’s a first look at version 0.1 taking shape.

![The first part of the journey is uploading planning documents.](first-look-at-extract.png)

## Improving accuracy

Gavin, Jordy and Rich are constantly looking at ways to improve the technical accuracy of Extract, based on some metrics set when the incubation phase was started. This continuous improvement mindset has already delivered impressive results, and it’ll keep quality high as we encounter new variations in document styles.

A couple weeks ago we spoke about ideas for using user behaviour to improve the accuracy of extracted shapes, and Gavin demo’d some experiments that had been happening. Whenever a user adjusts the position of a shape on the map, or adjust the lines and points that make up the shape, these corrections by users can be fed back to the model to improve outputs going forwards. 

![A blue shape and a red shape on a map. The blue shape shows the original extraction, and the red shape shows edits the user has made to the shape.](accuracy-modifier-engine.png)

This ‘accuracy modifier engine’ can also help us see how well the AI’s actions satisfy the user’s intent. Incorporating this kind of human feedback is crucial, but we’ll also be asking for qualitative feedback from users too. 

More details on this work in future.

## Using AI as a new material

Fabia and Steve had a think about an emerging design principle for the work, making more use of AI as a new material. 

We don’t want to build another GIS tool. Users have those. Using AI as a new material means speaking to the agent to shape things, the user’s intent becoming the agent’s actions. (And if this is too tricky, we can fall back to established tools and patterns.)

In some cases this could be quicker than editing point-by-point, though we’re aware that’s a behaviour users will be familiar with. It’s early thinking we’ll look to play with down the line.

## Next steps

Next week is all about getting the first research session completed and more research booked into the calendar. The sooner we can get to insights, the better, and we’re really chugging along now. 

Onwards!