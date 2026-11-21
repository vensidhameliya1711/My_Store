import React from 'react';
import { ShieldCheck, UserCheck, Truck } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-white text-gray-800 pt-16">
      <section className="relative bg-linear-to-r from-pink-50 to-pink-100/50 py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#f472b6_1px,transparent_1px)] bg-size-[16px_16px]"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <span className="text-pink-500 font-extrabold text-sm uppercase tracking-widest bg-pink-100/60 px-4 py-1.5 rounded-full">
            Our Story
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mt-6 tracking-tight leading-tight">
            Crafting Delightful <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-pink-500 to-rose-500">
              Shopping Experiences
            </span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Welcome to MyStore! We are dedicated to providing the highest quality products with a touch of elegance, simplicity, and unmatched customer service.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-950 tracking-tight">
              A boutique designed with you in mind.
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Founded in 2026, MyStore was created out of a desire to curate beautiful, durable, and unique lifestyle items. We work closely with manufacturers and designers across the globe to bring you products that inspire comfort and confidence in your daily life.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Whether you are styling your home, selecting a gift for a loved one, or upgrading your wardrobe, we ensure every detail meets our rigorous quality check. Everything we package is shipped with care from our store directly to your door.
            </p>
            <div className="pt-4 flex gap-8">
              <div>
                <span className="block text-4xl font-extrabold text-pink-500">10k+</span>
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Happy Customers</span>
              </div>
              <div>
                <span className="block text-4xl font-extrabold text-pink-500">100%</span>
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Quality Guarantee</span>
              </div>
              <div>
                <span className="block text-4xl font-extrabold text-pink-500">24/7</span>
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Customer Care</span>
              </div>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-pink-400 to-rose-400 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative overflow-hidden rounded-3xl shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=80"
                alt="Our store boutique"
                className="w-full h-[112] object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Our Core Values</h2>
            <p className="mt-4 text-gray-600">The pillars that define who we are and how we serve you.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center text-center group hover:bg-pink-50/50 hover:border-pink-100 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1">Uncompromising Quality</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                We believe products should be built to last. We handpick materials and scrutinize manufacturing processes to offer the finest goods.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center text-center group hover:bg-pink-50/50 hover:border-pink-100 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Truck className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1">Fast & Secured Shipping</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                No one likes to wait. We offer expedited fulfillment times and robust parcel protection so your purchases arrive perfectly and promptly.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center text-center group hover:bg-pink-50/50 hover:border-pink-100 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UserCheck className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1">Customer First</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Your happiness is our metric for success. Our support team is always ready to go the extra mile to put a smile on your face.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
