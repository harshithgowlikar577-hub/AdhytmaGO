// scripts/test-llm-conversations.mjs
const BASE = 'http://localhost:3000';

async function sendChat(label, { query, history = [], currentIntent = null, currentEntities = {} }) {
  console.log(`\n======================================================`);
  console.log(`TEST: ${label}`);
  console.log(`USER: "${query}"`);
  console.log(`PREV STATE: Intent=${currentIntent || 'None'}, Entities=${JSON.stringify(currentEntities)}`);

  try {
    const res = await fetch(`${BASE}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, history, currentIntent, currentEntities }),
    });

    const data = await res.json();
    console.log(`------------------------------------------------------`);
    console.log(`AI INTENT: ${data.intent} | STATE: ${data.state} | ACTION: ${data.action}`);
    console.log(`AI MESSAGE: "${data.message}"`);
    console.log(`KNOWN FIELDS: ${JSON.stringify(data.known_fields)} | MISSING: ${JSON.stringify(data.missing_fields)}`);
    console.log(`ENTITIES: ${JSON.stringify(data.entities)}`);
    if (data.recommendations && data.recommendations.length > 0) {
      console.log(`RECOMMENDATIONS (${data.recommendations.length} items):`);
      data.recommendations.slice(0, 2).forEach(r => {
        console.log(`  - [${r.matchScore}% Match] ${r.name} (${r.location}) - Reasons: ${r.matchReasons?.join(', ')}`);
      });
    }
    return data;
  } catch (err) {
    console.error(`ERROR:`, err.message);
  }
}

async function runTests() {
  console.log('--- STARTING COMPREHENSIVE AI/LLM CONVERSATION TESTS ---');

  // Test 1: Incomplete Initial Request (Missing mandatory location & date)
  const step1 = await sendChat('1. Missing Mandatory Fields (Ceremony only)', {
    query: 'I want to plan a Griha Pravesham',
  });

  // Test 2: Related but Insufficient Input (User gives language & experience preference, but city is still missing)
  const step2 = await sendChat('2. Related but Insufficient Input (Gives language, still missing location)', {
    query: 'I want an experienced Telugu priest',
    currentIntent: step1.intent,
    currentEntities: step1.entities,
  });

  // Test 3: Location provided, Date still missing
  const step3 = await sendChat('3. Location provided (Gachibowli, Hyderabad)', {
    query: 'In Gachibowli, Hyderabad',
    currentIntent: step2.intent,
    currentEntities: step2.entities,
  });

  // Test 4: Related Side Question (While Date is missing, asks "What is Griha Pravesham?")
  const step4 = await sendChat('4. Related Side Question ("What is Griha Pravesham?")', {
    query: 'What is Griha Pravesham?',
    currentIntent: step3.intent,
    currentEntities: step3.entities,
  });

  // Test 5: Unrelated Question Redirection ("What is Java?")
  const step5 = await sendChat('5. Unrelated Question Redirection ("What is Java?")', {
    query: 'What is Java?',
    currentIntent: step4.intent,
    currentEntities: step4.entities,
  });

  // Test 6: Completing Mandatory Requirements (Providing Date) -> Triggers Real Recommendations
  const step6 = await sendChat('6. Complete Requirements (Providing Date "Next Sunday")', {
    query: 'Next Sunday',
    currentIntent: step4.intent,
    currentEntities: step4.entities,
  });

  // Test 7: Explicit Intent Change ("Forget the priest. I want a function hall instead")
  const step7 = await sendChat('7. Explicit Intent Change ("Forget the priest, I want a hall")', {
    query: 'Forget the priest. I want a function hall instead with 400 capacity',
    currentIntent: step6.intent,
    currentEntities: step6.entities,
  });

  // Test 8: Multilingual Telugu Input
  const step8 = await sendChat('8. Multilingual Telugu Input ("నాకు గృహప్రవేశం కోసం తెలుగు పంతులు కావాలి")', {
    query: 'నాకు గృహప్రవేశం కోసం హైదరాబాద్‌లో తెలుగు పంతులు కావాలి',
  });

  // Test 9: Indirect & Emotionally phrased request with abbreviation ("I am shifting to a new house and want to do something traditional in Hyd")
  const step9 = await sendChat('9. Indirect & Emotionally phrased request with abbreviation', {
    query: 'I am shifting to a new house and want to do something traditional in Hyd next month',
  });

  // Test 10: Slang & Budget request ("Need a marriage hall in Gachibowli for 500 ppl under 1 lakh on Sunday")
  const step10 = await sendChat('10. Slang & Budget request for 500 ppl under 1 lakh', {
    query: 'Need a marriage hall in Gachibowli for 500 ppl under 1 lakh on Sunday',
  });

  console.log('\n======================================================');
  console.log('--- ALL AI/LLM CONVERSATION TESTS COMPLETED SUCCESSFULLY ---');
}

runTests();
