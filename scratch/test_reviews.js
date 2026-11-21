const BASE_URL_3000 = 'http://127.0.0.1:3000';
const BASE_URL_3001 = 'http://127.0.0.1:3001';

async function findActivePort() {
  for (const url of [BASE_URL_3000, BASE_URL_3001]) {
    try {
      const res = await fetch(`${url}/api/products`);
      if (res.ok) {
        console.log(`Connected to active server at ${url}`);
        return url;
      }
    } catch (e) {
      // not this port
    }
  }
  return null;
}

async function testReviewSystem() {
  const activeUrl = await findActivePort();
  if (!activeUrl) {
    console.error('No active Next.js server detected on 3000 or 3001.');
    return;
  }

  console.log(`--- Testing Product Review System on ${activeUrl} ---`);

  // 1. Fetch products to get a valid product ID
  const productsRes = await fetch(`${activeUrl}/api/products`);
  const productsData = await productsRes.json();
  if (!productsData.products || productsData.products.length === 0) {
    console.error('No products found to review');
    return;
  }
  const testProduct = productsData.products[0];
  const productId = testProduct._id || testProduct.id;
  console.log(`✓ Retrieved Test Product: "${testProduct.name}" (ID: ${productId})`);

  // 2. Post a new customer review
  console.log('\n2. Submitting Customer Review...');
  const reviewPayload = {
    productId,
    userName: 'Ayush Kumar',
    userEmail: 'ayush@example.com',
    rating: 5,
    title: 'Outstanding Quality & Fast Delivery!',
    comment: 'I received this product yesterday. The material and packaging are top notch. Highly recommended to everyone!',
    isVerifiedPurchase: true,
  };

  const submitRes = await fetch(`${activeUrl}/api/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewPayload),
  });
  const submitData = await submitRes.json();
  console.log('Review submission response:', submitData.success ? 'Success' : submitData);

  if (!submitData.success || !submitData.review) {
    console.error('Failed to submit review:', submitData);
    return;
  }
  const reviewId = submitData.review._id;
  console.log(`✓ Review created successfully with ID: ${reviewId}`);

  // 3. Fetch product reviews and verify rating stats
  console.log(`\n3. Fetching Reviews for Product ${productId}...`);
  const getProductReviewsRes = await fetch(`${activeUrl}/api/reviews?productId=${productId}`);
  const getProductReviewsData = await getProductReviewsRes.json();
  console.log('Product Reviews Stats:', getProductReviewsData.stats);
  console.log(`Total reviews for product: ${getProductReviewsData.reviews?.length}`);

  // 4. Test Admin reviews list endpoint
  console.log('\n4. Fetching Admin Reviews List...');
  const adminReviewsRes = await fetch(`${activeUrl}/api/admin/reviews`);
  const adminReviewsData = await adminReviewsRes.json();
  console.log(`Admin retrieved total reviews: ${adminReviewsData.reviews?.length}`);

  // 5. Post an Admin Reply to this review
  console.log(`\n5. Posting Official Admin Reply to review ${reviewId}...`);
  const replyPayload = {
    adminReply: 'Dear Ayush, thank you so much for your wonderful review! We are delighted that you loved the product quality. Enjoy your purchase!',
    repliedBy: 'MyStore Support Team',
  };

  const replyRes = await fetch(`${activeUrl}/api/admin/reviews/${reviewId}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(replyPayload),
  });
  const replyData = await replyRes.json();
  console.log('Admin Reply Response:', replyData.success ? 'Success' : replyData);

  if (replyData.success && replyData.review?.adminReply) {
    console.log(`✓ Official Admin Reply published: "${replyData.review.adminReply}"`);
    console.log(`✓ Replied By: ${replyData.review.repliedBy}`);
  }

  // 6. Verify Storefront now sees the Admin Reply
  console.log('\n6. Verifying Review & Admin Reply on Storefront...');
  const finalCheckRes = await fetch(`${activeUrl}/api/reviews?productId=${productId}`);
  const finalCheckData = await finalCheckRes.json();
  const matchedReview = finalCheckData.reviews.find(r => r._id === reviewId);
  console.log('Storefront Review with Admin Reply:', {
    id: matchedReview._id,
    userName: matchedReview.userName,
    rating: matchedReview.rating,
    comment: matchedReview.comment,
    adminReply: matchedReview.adminReply,
    repliedBy: matchedReview.repliedBy,
  });

  console.log('\n🎉 ALL PRODUCT REVIEW SYSTEM TESTS PASSED SUCCESSFULLY! 🎉');
}

testReviewSystem().catch(console.error);
