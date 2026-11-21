const BASE_URL_3000 = 'http://127.0.0.1:3000';
const BASE_URL_3001 = 'http://127.0.0.1:3001';

async function findActivePort() {
  for (const url of [BASE_URL_3000, BASE_URL_3001]) {
    try {
      const res = await fetch(`${url}/api/products`);
      if (res.ok) return url;
    } catch (e) {}
  }
  return null;
}

async function runGateTests() {
  const activeUrl = await findActivePort();
  if (!activeUrl) {
    console.error('No active Next.js server detected.');
    return;
  }
  console.log(`--- Testing Purchase Verification Gate on ${activeUrl} ---`);

  // 1. Get products
  const productsRes = await fetch(`${activeUrl}/api/products`);
  const productsData = await productsRes.json();
  const testProduct = productsData.products[0];
  const productId = testProduct._id || testProduct.id;
  console.log(`✓ Test Product: "${testProduct.name}" (${productId})`);

  // 2. Test non-buyer GET request
  console.log('\n--- Test 1: Non-buyer / Unauthenticated user check ---');
  const nonBuyerGet = await fetch(`${activeUrl}/api/reviews?productId=${productId}&userEmail=random_unrelated_user@mail.com`);
  const nonBuyerGetData = await nonBuyerGet.json();
  console.log('Non-buyer canReview status:', nonBuyerGetData.canReview);
  if (nonBuyerGetData.canReview === false) {
    console.log('✓ PASS: Non-buyer is not allowed to review (canReview is false)');
  } else {
    console.error('✕ FAIL: Non-buyer was incorrectly allowed to review');
  }

  // 3. Test non-buyer POST request (Attempting unauthorized review)
  console.log('\n--- Test 2: Non-buyer POST review submission attempt ---');
  const unauthorizedPost = await fetch(`${activeUrl}/api/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId,
      userName: 'Unverified Visitor',
      userEmail: 'unverified_visitor_999@mail.com',
      rating: 1,
      title: 'Fake Review',
      comment: 'I never bought this product but I want to spam a review.',
    }),
  });
  const unauthorizedPostData = await unauthorizedPost.json();
  console.log('Unauthorized POST response status:', unauthorizedPost.status);
  console.log('Unauthorized POST response body:', unauthorizedPostData);

  if (unauthorizedPost.status === 403 && !unauthorizedPostData.success) {
    console.log('✓ PASS: Server blocked review submission from non-buyer (HTTP 403 Forbidden)');
  } else {
    console.error('✕ FAIL: Server did not block non-buyer');
  }

  // 4. Test buyer with Delivered order (Ayush Kumar)
  console.log('\n--- Test 3: Delivered buyer check ---');
  // First let's check orders for a buyer with delivered order or create one
  const buyerGet = await fetch(`${activeUrl}/api/reviews?productId=${productId}&userEmail=ayush@example.com`);
  const buyerGetData = await buyerGet.json();
  console.log('Delivered Buyer GET response:', {
    canReview: buyerGetData.canReview,
    hasUserReview: Boolean(buyerGetData.userReview),
    eligibleOrderId: buyerGetData.eligibleOrderId,
  });

  console.log('\n🎉 ALL PURCHASE VERIFICATION GATE TESTS COMPLETED! 🎉');
}

runGateTests().catch(console.error);
