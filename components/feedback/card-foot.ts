// The size of the small controls in a Suggestion card's footer (upvote,
// withdraw, the review page's approve and reject). Their look is the
// Button's variant.
export const FOOT_ACTION = "h-[30px] gap-1.5 px-2 text-[0.82rem] [&_svg:not([class*='size-'])]:size-3.5";

// An outlined footer action (upvote, approve): the outline's rule sits inside
// the same box, so it gives up a pixel of padding to it. A filled one (an
// upvote cast) drops the rule so its ground reaches the edge.
export const FOOT_ACTION_OUTLINED = "h-[30px] gap-1.5 px-[9px] text-[0.82rem] [&_svg:not([class*='size-'])]:size-3.5";
