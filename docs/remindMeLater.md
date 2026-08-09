# Feature on Hold: Advanced "Touched" Question Penalty Calculation

**Context**: During the development of the "Admin Disconnect Recovery Feature" (allowing an admin to manually restart a disconnected team's timer while deducting 1 minute per answered question to prevent cheating).

**The Issue**: 
We initially discussed deducting 1 minute for *any* question the team had "touched". If we define "touched" as simply looking at a question (`status === 'not_answered'`), it penalizes teams who are just quickly skimming through the paper without attempting to solve anything. 

To give teams more liberty, we have temporarily reverted the logic. The current penalty *only* deducts 1 minute if the team:
1. Actually selected an option (`selected !== null`)
2. Explicitly marked the question for review (`marked_for_review`)

**Next Steps**:
This exact definition of what constitutes a "touched/penalizable" question is on hold. 
Remind me about this when we reach **Steps 9-10** (Admin Live Monitor / Final Polish) so we can finalize exactly how the admin penalty deduction should calculate the consumed time.
