/*
==========================================================
JSONS DIGITAL SCORE ANALYSIS
==========================================================
*/


/*
  PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE
*/

const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxHnbZdu8_91rgjB3_oNogn2FKGTTuvRJ954CEz4u5Oj_iZ_nVU6qcyA8738UXLkhP7/exec";


/*
  Your WhatsApp number.

  Country code 91 + 8610817060
*/

const WHATSAPP_NUMBER =
  "918610817060";


/*
  SCORE LEVELS
*/

const PASS_SCORE = 95;

const HIGH_RISK_SCORE = 50;



/*
==========================================================
START
==========================================================
*/

document.addEventListener(
  "DOMContentLoaded",
  function () {

    document.getElementById("year").textContent =
      new Date().getFullYear();


    const form =
      document.getElementById("auditForm");


    const resetBtn =
      document.getElementById("resetBtn");


    form.addEventListener(
      "submit",
      runTest
    );


    resetBtn.addEventListener(
      "click",
      resetTest
    );

  }
);



/*
==========================================================
NORMALIZE NAME
==========================================================

Examples:

ABC Digital Studio
abc.digital.studio
@abc_digital_studio

all become:

abcdigitalstudio
*/

function normalize(value) {

  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?/, "")
    .replace(/^instagram\.com\//, "")
    .replace(/[^a-z0-9]/g, "");

}



/*
==========================================================
SIMILARITY
==========================================================

Returns 0 - 100.

Uses Levenshtein distance.
*/

function similarity(a, b) {

  a = normalize(a);
  b = normalize(b);


  if (!a || !b) {
    return 0;
  }


  if (a === b) {
    return 100;
  }


  const matrix = [];


  for (
    let i = 0;
    i <= b.length;
    i++
  ) {

    matrix[i] = [i];

  }


  for (
    let j = 0;
    j <= a.length;
    j++
  ) {

    matrix[0][j] = j;

  }


  for (
    let i = 1;
    i <= b.length;
    i++
  ) {

    for (
      let j = 1;
      j <= a.length;
      j++
    ) {

      if (
        b.charAt(i - 1) ===
        a.charAt(j - 1)
      ) {

        matrix[i][j] =
          matrix[i - 1][j - 1];

      } else {

        matrix[i][j] =
          Math.min(

            matrix[i - 1][j - 1] + 1,

            matrix[i][j - 1] + 1,

            matrix[i - 1][j] + 1

          );

      }

    }

  }


  const distance =
    matrix[b.length][a.length];


  const longest =
    Math.max(
      a.length,
      b.length
    );


  return Math.max(
    0,
    Math.round(
      (1 - distance / longest) * 100
    )
  );

}



/*
==========================================================
INSTAGRAM SUGGESTION
==========================================================
*/

function makeInstagramSuggestion(
  businessName
) {

  return normalize(
    businessName
  );

}



/*
==========================================================
GET PRIVATE RECOMMENDATION

This is also sent to Google Sheets.

The customer does NOT see this detailed recommendation.
*/

function getRecommendation(
  businessName,
  googleName,
  instagramHandle,
  businessGoogle,
  businessInstagram,
  googleInstagram,
  score
) {


  /*
    Already good.
  */

  if (score >= PASS_SCORE) {

    return {

      recommendation:
        "No major naming change required.",

      recommendedName:
        businessName,

      priority:
        "LOW",

      explanation:
        "All three submitted names are at or above the 95% consistency target."

    };

  }



  /*
    Find weakest relationship.
  */

  const comparisons = [

    {
      name: "Google Business Profile",
      score: businessGoogle
    },

    {
      name: "Instagram",
      score: businessInstagram
    },

    {
      name: "Google Business Profile + Instagram",
      score: googleInstagram
    }

  ];


  comparisons.sort(
    function (a, b) {
      return a.score - b.score;
    }
  );


  const weakest =
    comparisons[0];



  /*
    GOOGLE IS THE WEAKEST
  */

  if (
    weakest.name ===
    "Google Business Profile"
  ) {

    return {

      recommendation:
        "Change the Google Business Profile name to match the main business name as closely as practical.",

      recommendedName:
        businessName,

      priority:
        "GOOGLE BUSINESS PROFILE",

      explanation:
        `Current Google Business Profile name: "${googleName}". Recommended target: "${businessName}". Aligning the Google name with the main business name would bring this comparison to 100% by this scoring method.`

    };

  }



  /*
    INSTAGRAM IS THE WEAKEST
  */

  if (
    weakest.name ===
    "Instagram"
  ) {

    return {

      recommendation:
        "Change the Instagram handle to a handle closely matching the main business name.",

      recommendedName:
        "@" +
        makeInstagramSuggestion(
          businessName
        ),

      priority:
        "INSTAGRAM",

      explanation:
        `Current Instagram handle: "${instagramHandle}". Recommended target: "@${makeInstagramSuggestion(businessName)}". Aligning the handle with the main business name would bring this comparison to 100% by this scoring method.`

    };

  }



  /*
    BOTH GOOGLE AND INSTAGRAM
  */

  return {

    recommendation:
      "Align both the Google Business Profile name and Instagram handle with the main business name.",

    recommendedName:
      businessName,

    priority:
      "GOOGLE + INSTAGRAM",

    explanation:
      `Use "${businessName}" as the primary naming reference. Align the Google Business Profile name and Instagram handle as closely as practical with this name.`

  };

}



/*
==========================================================
RUN TEST
==========================================================
*/

async function runTest(event) {

  event.preventDefault();


  const submitBtn =
    document.getElementById("submitBtn");


  submitBtn.disabled = true;


  submitBtn.querySelector("span")
    .textContent =
    "CHECKING...";


  /*
    Get form values.
  */

  const name =
    document
      .getElementById("name")
      .value
      .trim();


  const businessName =
    document
      .getElementById("businessName")
      .value
      .trim();


  const email =
    document
      .getElementById("email")
      .value
      .trim();


  const phone =
    document
      .getElementById("phone")
      .value
      .trim();


  const instagram =
    document
      .getElementById("instagram")
      .value
      .trim();


  const googleBusiness =
    document
      .getElementById("googleBusiness")
      .value
      .trim();



  /*
    Calculate all three comparisons.
  */

  const businessGoogle =
    similarity(
      businessName,
      googleBusiness
    );


  const businessInstagram =
    similarity(
      businessName,
      instagram
    );


  const googleInstagram =
    similarity(
      googleBusiness,
      instagram
    );



  /*
    The final score is the weakest
    of the three relationships.
  */

  const score =
    Math.min(
      businessGoogle,
      businessInstagram,
      googleInstagram
    );



  /*
    Determine risk.
  */

  let risk = "";


  if (
    score < HIGH_RISK_SCORE
  ) {

    risk =
      "BUSINESS AT HIGH RISK";

  } else if (
    score < PASS_SCORE
  ) {

    risk =
      "BUSINESS AT RISK";

  } else {

    risk =
      "LOW RISK";

  }



  /*
    Private recommendation for your Sheet.
  */

  const recommendation =
    getRecommendation(

      businessName,

      googleBusiness,

      instagram,

      businessGoogle,

      businessInstagram,

      googleInstagram,

      score

    );



  /*
    Save lead.
  */

  saveLead({

    name:
      name,

    businessName:
      businessName,

    email:
      email,

    phone:
      phone,

    instagram:
      instagram,

    googleBusiness:
      googleBusiness,

    score:
      score,

    risk:
      risk,

    businessGoogle:
      businessGoogle,

    businessInstagram:
      businessInstagram,

    googleInstagram:
      googleInstagram,

    recommendation:
      recommendation

  });



  /*
    Show result.
  */

  showResult({

    businessName:
      businessName,

    score:
      score,

    risk:
      risk,

    businessGoogle:
      businessGoogle,

    businessInstagram:
      businessInstagram,

    googleInstagram:
      googleInstagram

  });


  submitBtn.disabled = false;


  submitBtn.querySelector("span")
    .textContent =
    "START TEST";

}



/*
==========================================================
SAVE TO GOOGLE SHEETS
==========================================================
*/

function saveLead(data) {


  /*
    Don't try to save until you
    have pasted the Apps Script URL.
  */

  if (
    !GOOGLE_APPS_SCRIPT_URL ||
    GOOGLE_APPS_SCRIPT_URL.includes(
      "PASTE_YOUR"
    )
  ) {

    console.warn(
      "Google Apps Script URL has not been configured."
    );

    return;

  }



  const payload = {

    timestamp:
      new Date().toISOString(),

    name:
      data.name,

    businessName:
      data.businessName,

    email:
      data.email,

    phone:
      data.phone,

    instagram:
      data.instagram,

    googleBusiness:
      data.googleBusiness,

    score:
      data.score,

    risk:
      data.risk,

    businessGoogle:
      data.businessGoogle,

    businessInstagram:
      data.businessInstagram,

    googleInstagram:
      data.googleInstagram,

    recommendation:
      data.recommendation.recommendation,

    recommendedName:
      data.recommendation.recommendedName,

    priority:
      data.recommendation.priority,

    explanation:
      data.recommendation.explanation

  };



  /*
    no-cors is intentional.

    We only need to send the lead.
    We don't need to read the response.
  */

  fetch(
    GOOGLE_APPS_SCRIPT_URL,
    {

      method:
        "POST",

      mode:
        "no-cors",

      headers: {

        "Content-Type":
          "text/plain;charset=utf-8"

      },

      body:
        JSON.stringify(payload)

    }
  )
  .catch(
    function (error) {

      console.error(
        "Could not save lead:",
        error
      );

    }
  );

}



/*
==========================================================
SHOW CUSTOMER RESULT
==========================================================
*/

function showResult(data) {


  const results =
    document.getElementById(
      "results"
    );


  const riskTag =
    document.getElementById(
      "riskTag"
    );


  const resultTitle =
    document.getElementById(
      "resultTitle"
    );


  const resultIntro =
    document.getElementById(
      "resultIntro"
    );


  const adviceTitle =
    document.getElementById(
      "adviceTitle"
    );


  const adviceText =
    document.getElementById(
      "adviceText"
    );


  const marketingAdvice =
    document.getElementById(
      "marketingAdvice"
    );



  /*
    Scores.
  */

  document.getElementById(
    "overallScore"
  ).textContent =
    data.score;


  document.getElementById(
    "googleScore"
  ).textContent =
    data.businessGoogle;


  document.getElementById(
    "instagramScore"
  ).textContent =
    data.businessInstagram;



  /*
    Progress bars.
  */

  document.getElementById(
    "googleProgress"
  ).style.width =
    data.businessGoogle + "%";


  document.getElementById(
    "instagramProgress"
  ).style.width =
    data.businessInstagram + "%";



  /*
    Summaries.
  */

  document.getElementById(
    "googleSummary"
  ).textContent =
    `Business name vs Google Business Profile: ${data.businessGoogle}% similarity.`;


  document.getElementById(
    "instagramSummary"
  ).textContent =
    `Business name vs Instagram handle: ${data.businessInstagram}% similarity.`;



  /*
    Reset risk classes.
  */

  riskTag.className =
    "risk-tag";



  /*
    HIGH RISK
  */

  if (
    data.score < HIGH_RISK_SCORE
  ) {

    riskTag.classList.add(
      "high-risk"
    );


    riskTag.textContent =
      "BUSINESS AT HIGH RISK";


    resultTitle.textContent =
      "Your business name consistency needs attention.";


    resultIntro.textContent =
      "There is a significant difference between the business name, Google Business Profile name and Instagram handle you entered.";


    adviceTitle.textContent =
      "There is a significant naming discrepancy.";


    adviceText.textContent =
      "This inconsistency may make it harder for customers to recognize and connect your profiles.";


    marketingAdvice.innerHTML = `

      <div>
        <b>01</b>
        <span>
          <strong>SEO:</strong>
          Use your business name, primary service and location naturally across your website and online profiles.
        </span>
      </div>

      <div>
        <b>02</b>
        <span>
          <strong>Profile picture:</strong>
          Use a clear and recognizable logo consistently across Google and Instagram.
        </span>
      </div>

      <div>
        <b>03</b>
        <span>
          <strong>Instagram Highlights:</strong>
          Organize useful information into Services, Products, Reviews, Work, FAQs and Contact.
        </span>
      </div>

      <div>
        <b>04</b>
        <span>
          <strong>Reviews:</strong>
          Encourage genuine customers to leave Google reviews and respond professionally to reviews.
        </span>
      </div>

      <div>
        <b>05</b>
        <span>
          <strong>Customer feedback:</strong>
          Use recurring customer feedback to improve your service, content and customer experience.
        </span>
      </div>

      <div>
        <b>06</b>
        <span>
          <strong>Consistency:</strong>
          Keep your business name, contact details, branding and messaging consistent across platforms.
        </span>
      </div>

    `;

  }



  /*
    BUSINESS AT RISK
  */

  else if (
    data.score < PASS_SCORE
  ) {

    riskTag.classList.add(
      "medium-risk"
    );


    riskTag.textContent =
      "BUSINESS AT RISK";


    resultTitle.textContent =
      "Your business has a naming discrepancy.";


    resultIntro.textContent =
      "The names you entered are not sufficiently consistent across your business, Google and Instagram profiles.";


    adviceTitle.textContent =
      "There is a discrepancy between your business name, Google Business Profile and Instagram handle.";


    adviceText.textContent =
      "Consistent naming can make your digital presence easier for customers to recognize and trust.";


    marketingAdvice.innerHTML = `

      <div>
        <b>01</b>
        <span>
          <strong>SEO:</strong>
          Make sure your website and Google Business Profile clearly communicate what your business does and where you serve customers.
        </span>
      </div>

      <div>
        <b>02</b>
        <span>
          <strong>Profile picture:</strong>
          Keep your logo or profile image consistent so customers can recognize your brand.
        </span>
      </div>

      <div>
        <b>03</b>
        <span>
          <strong>Instagram Highlights:</strong>
          Keep useful highlights such as Services, Products, Reviews, FAQs and Contact updated.
        </span>
      </div>

      <div>
        <b>04</b>
        <span>
          <strong>Reviews:</strong>
          Regularly encourage satisfied customers to leave genuine Google reviews and reply to them.
        </span>
      </div>

      <div>
        <b>05</b>
        <span>
          <strong>Feedback:</strong>
          Pay attention to recurring customer feedback and use it to improve your customer experience.
        </span>
      </div>

      <div>
        <b>06</b>
        <span>
          <strong>Brand consistency:</strong>
          Try to maintain the same business name, visual identity and contact information across profiles.
        </span>
      </div>

    `;

  }



  /*
    LOW RISK
  */

  else {

    riskTag.classList.add(
      "low-risk"
    );


    riskTag.textContent =
      "LOW RISK";


    resultTitle.textContent =
      "Your business name looks consistent.";


    resultIntro.textContent =
      "The business name, Google Business Profile name and Instagram handle are strongly aligned.";


    adviceTitle.textContent =
      "Your naming consistency is looking good.";


    adviceText.textContent =
      "Keep this consistency as your business grows. A recognizable name across platforms makes it easier for customers to find and remember you.";


    marketingAdvice.innerHTML = `

      <div>
        <b>01</b>
        <span>
          <strong>SEO:</strong>
          Keep your website and Google Business Profile updated with accurate business information, services and location details.
        </span>
      </div>

      <div>
        <b>02</b>
        <span>
          <strong>Profile picture:</strong>
          Continue using a clear and recognizable logo or profile image across your platforms.
        </span>
      </div>

      <div>
        <b>03</b>
        <span>
          <strong>Instagram Highlights:</strong>
          Keep useful highlights such as Services, Products, Reviews, FAQs and Contact updated.
        </span>
      </div>

      <div>
        <b>04</b>
        <span>
          <strong>Reviews:</strong>
          Continue encouraging genuine customers to leave reviews and respond professionally.
        </span>
      </div>

      <div>
        <b>05</b>
        <span>
          <strong>Customer feedback:</strong>
          Turn useful customer feedback into improvements, FAQs, posts and new content ideas.
        </span>
      </div>

      <div>
        <b>06</b>
        <span>
          <strong>Consistency:</strong>
          Keep your business name, contact details, branding and messaging consistent as your business grows.
        </span>
      </div>

    `;

  }



  /*
    WhatsApp message.
  */

  const whatsappButton =
    document.getElementById(
      "whatsappBtn"
    );


  const message =
    `Hi JSONS Branding Studio, I completed the Digital Presence Check for ${data.businessName}. My score was ${data.score}%. I would like help fixing the issues.`;



  whatsappButton.href =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;



  /*
    Show results.
  */

  results.classList.remove(
    "hidden"
  );


  results.scrollIntoView({

    behavior:
      "smooth",

    block:
      "start"

  });

}



/*
==========================================================
RESET
==========================================================
*/

function resetTest() {

  document
    .getElementById("results")
    .classList.add("hidden");


  document
    .getElementById("auditForm")
    .reset();


  document
    .getElementById("auditFormCard")
    .scrollIntoView({

      behavior:
        "smooth",

      block:
        "center"

    });

}
