# AI Audit Trail

Every AI-assisted action taken while building this project, in order. Tool: Claude (Anthropic), interactive chat with code execution (bash, file edit/create, build/test running).

| # | Action | AI Involvement | Manual Review / Changes |
|---|--------|----------------|--------------------------|
| 1 | Project scaffold (`create-next-app`) | AI ran scaffolding command with TypeScript/Tailwind/App Router | Verified config output 
| 2 | Data model design (`lib/types.ts`) | AI proposed the `Product`/`Variant`/`PricePoint`/`DeliveryZone`/`ConfidenceResult` shape | Reviewed for completeness against the brief's 5 customer questions (availability, size, price, delivery trust, alternatives) |
| 3 | Frontend components + pages | AI built `SizeSelector`, `DeliverySelector`, product page, home page | Reviewed against the required user flow (discover → check size/price/delivery → decide) |
| 4 | Visual design | AI followed an internal design-system process (palette/type/layout plan reviewed against "does this look like a generic AI template" before building) to land on an editorial green/rose/bronze identity instead of default AI-template styling | Accepted; matches a fashion-marketplace subject better than a generic dashboard look |
| 5 | Test suite | AI wrote 12 unit tests for `lib/confidence.ts` covering the scoring engine and alternatives matching, including a dedicated test for the bug found in #10 
| 6 | Added explicit "Why?" breakdown per user request | AI rewrote factor detail strings to be single self-contained lines (rather than label+detail pairs), added a "Why?" heading to the factors component, added a new "alternate sizes available" factor when the chosen size is out but others aren't, and added a regression test for it | Verified live API output against the two example formats requested, confirmed near-exact match; re-ran full test suite (13/13 pass) and build |

**Overall verification approach:** rather than accepting generated code as final, every stage that could fail silently (build, runtime, API responses, and now visual output) was actually executed and inspected before moving on. Two real issues were caught this way: the out-of-stock scoring bug (#10) and the broken garment-silhouette illustration (#14) — neither was found by reading code alone.
