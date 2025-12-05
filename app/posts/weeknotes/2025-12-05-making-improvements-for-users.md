---
layout: post
title: Making improvements for users
description: We’re focusing on what users actually need – from simple data uploads to tools which match their existing processes. By working with AI’s limitations and listening closely to users, we’re uncovering the dynamics of human-AI collaboration.
date: 2025-12-05
author: Steve Messer
---

It’s the seventh week of the alpha phase of Extract. We’ve been working on two timelines this week: what we’re doing over the next two weeks, and what we may be doing in the next couple of months. Acting on the now, and thinking ahead. 

## Making improvements

The first research session generated a series of insights which we’ve put into 3 categories:

- Concept: the overarching idea & value proposition of the solution.
- Context: the environment and workflows in which the solution operates.
- Usability: the practical experience of interacting with the solution.

The insights we’ve categorised as conceptual and contextual can impact the success of Extract as a product as much as the usability insights, but we’re better able to act on and improve the usability issues. So we’ve been working on making those improvements before addressing the conceptual and contextual insights that were raised. 

### Human-computer dynamics

Ethan Mollick shared the concept of ‘centaurs’ in his book _Co-Intelligence_. Working like a centaur means giving AI tasks you hate but can easily check, seeing whether it speeds things up or allows you to focus on other, more meaningful tasks. 

Compared to humans, AI is not yet good at many things but does produce good outputs in a lot of other areas. Ethan Mollick called this ‘the jagged frontier’, and it’s why taking the centaur approach is useful. If AI cannot produce perfect outputs but can create something good enough – something you can improve and work with – the outputs from AI can still be useful. Indeed, that’s what users indicated to us in [the first research session](https://digital-land.github.io/extract-alpha/weeknotes/early-insights-from-users/#:~:text=Even%20when%20an%20extraction%20was%20less%20successful%2C%20users%20were%20interested%20in%20being%20able%20to%20easily%20transfer%20and%20reuse%20parts%20of%20the%20data%20within%20their%20own%20systems%20and%20tools.).

It’s clear that humans being able to smooth out the rough edges where AI isn’t good enough may be a factor in real-world AI adoption for some time. Helen Toner, the interim executive director at Georgetown’s Center for Security and Emerging Technology, [wrote about that recently](https://helentoner.substack.com/p/taking-jaggedness-seriously), saying:

> We should be thinking more about human-computer interaction dynamics, human factors, user experience, user interface. What does the trust between those parties look like? How do you maximize the benefit that you’re able to get from those AI systems by designing that human-AI system well? As opposed to just skipping to the end and assuming, well, at some point the AI is going to automate all of it, so who cares about the human-computer part.

There’s lots we can learn in this space – human-computer interaction – that can be useful. Addressing the usability issues first can also help us draw out more of the conceptual and contextual issues (which require more evidence to prove) in further studies, so it feels sensible to look at these first. 

### Usability issues

Our first prototype was stripped back, a basic flow and set of tools allowing users to upload a document, extract the data, and approve or reject the extraction. We didn’t include any editing tools as we wanted to understand whether it was good enough as it was. We expected to be proven wrong, and that ended up being true.

Because the prototype was so minimal, a few issues came up. However, except the lack of editing tools, these issues weren’t major. On the whole, users understood what to do, completed the task in under 10 minutes, and a couple of participants even downloaded the data to refine further elsewhere. Not bad.

Some of the issues included:

- extraction time duration and signposting
- only being able to upload PDFs
- not realising you could drag & drop files (but being used to doing that)
- how we designed the review stage, where users compare the original document to the extracted data
- matching map data with related text data

We spent the majority of the week addressing these through interface changes, a complete re-design of the user journey, and better content design (clearer labelling, improved instructions). We believe these should make it easier for users to use Extract, and the addition of editing tools may influence more users to approve and export the outputted data.

We’re running another round of research and testing next week, and we can’t wait!

### The editing tool

In a previous weeknote, we shared how we’d [re-used HM Land Registry’s map component](https://digital-land.github.io/extract-alpha/weeknotes/first-research-session-booked/#:~:text=Re%2Dusing%20HM%20Land%20Registry’s%20map%20component) as the basis for our own. We’ve been building on top of that, adding more features for the upcoming testing. 

Firstly we’ve developed new shape creation tools, allowing users to snap lines and points to the map for greater accuracy. Some users mentioned that they draw lines on the side of the road, some mentioned they draw lines in the middle of the road, and our tools should support both use cases.

We’ve also added the option to toggle satellite view, which is especially helpful in viewing whether a tree is placed correctly. 

![A map component with tools to toggle satellite view, plus change, move, rotate, cut, add and delete shapes.](new-map-tools.gif)

We’ve also been working on the accessibility features, making it possible to navigate the map, move shapes and edit shapes using a keyboard. When you get feedback from people with disabilities early in the design and build of a product or service, problems become easier to fix, and you come up with solutions that benefit everyone. We wanted to get this in now rather than later, when it’s more expensive to address.

![A map component with keyboard navigation tools for accessibility.](map-accessibility.gif)

## Gemini 3

Google’s newest release, Gemini 3 Pro, is now integrated into Extract. Gemini 3 is better at deciphering and pulling information from legacy records, is more reliable, and excels at vision tasks.

We tested a single-shot prompt from Gemini 3 Pro against our current multi-stage tree preservation order (TPO) extractor (Gemini 2.5 Flash) and noticed significant improvements.

- **Speed**: Single-shot Gemini 3 Pro is comparable in time to our previous method.
- **Reliability**: It is highly reliable, returning successfully on every one of the hundreds of examples tested. 
- **Accuracy**: Extraction of trees from TPO documents is much more accurate. The F1 score (a measure of the overall quality of a predictor) is consistently higher. Crucially, Gemini 3 is far more likely to get the tree’s location exactly right (within one marker’s width).

## Extending the alpha

We’ve decided to extend the alpha period into next year. Originally we set ourselves a tight timebox, trying to learn as much as possible inside 8 weeks. Though we held one research session and have another coming up next week, the insights we’re getting back indicate that we’ll need time to learn more.

It’s not surprising. Artificial intelligence is a new technology, there aren’t well established patterns for interacting with it yet, and the planning domain requires precision. Quality and trust are major factors in doing this well. 

Spending more time with users, collecting more insights, will massively improve our ability to mitigate risks and [build the right thing](https://www.atlassian.com/blog/jira-product-discovery/how-to-build-the-right-thing-and-prevent-building-the-wrong-ones). We’re extending the alpha phase by another 4 weeks, covering January 2026. 

## Thinking ahead to the beta

We’ve also been thinking ahead to the [beta phase](https://www.gov.uk/service-manual/agile-delivery/how-the-beta-phase-works), where we take our best idea from alpha and start building it for real. 

We want to make sure that local planning authorities are available for research and testing, to be part of the private beta, hence why we’re thinking about this now. We can’t build and improve Extract without their input, and they rightfully need time to plan how they’d get involved. 

We’ll share firmer plans in the next couple of weeks, but if you’re a local planning authority with thousands of planning documents you need to convert into data (tree preservation orders, Article 4 directions and conservation areas), [get in touch](https://www.planning.data.gov.uk/about/contact).

## And finally...

Goodbye to Jenny, one of our product managers, who’s leaving us today. Jenny’s done a lot on Extract over this year, and we’re really grateful for all her input. 

Bye Jenny!