import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  const handleShopNow = () => {
    navigate("/shop");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
      {/* Hero Section */}
      <div className="relative bg-black text-white py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black opacity-90"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            BIAS
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Where style meets story. Born from the beats of hip hop and the
            values of simplicity and self-expression.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Image Section */}
            <div className="relative">
              <img
                src="/src/images/about-pic.jpg"
                alt="BIAS Clothing Story"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-4 -right-4 bg-black text-white px-4 py-2 rounded-full text-sm font-medium">
                EST. 2019
              </div>
            </div>

            {/* Text Content */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Our Story
                </h2>
                <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                  <p>
                    BIAS Clothing was born from a blend of cultures, rhythms,
                    and everyday comfort. Founded by a half-Filipino,
                    half-Japanese creative raised on the beats of hip hop and
                    the values of simplicity and self-expression, BIAS is more
                    than just a clothing brand — it's a movement.
                  </p>
                  <p>
                    Growing up, our founder was deeply inspired by hip hop not
                    just as a genre of music, but as a way of life. From the raw
                    lyrics and street dance to oversized fits and unapologetic
                    individuality, hip hop was freedom — a space where you could
                    be yourself, speak your truth, and own your story.
                  </p>
                </div>
              </div>

              {/* Quote Section */}
              <div className="bg-gray-50 rounded-2xl p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    "Why can't these bold, expressive pieces be part of everyday
                    comfort?"
                  </h3>
                  <p className="text-gray-600 italic">
                    — The question that started it all
                  </p>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed text-center">
                  And so, BIAS Clothing was stitched into reality — blending the
                  bold spirit of streetwear with silhouettes made for daily
                  wear. Our pieces are made to move with you, chill with you,
                  and speak volumes without saying a word. Whether you're on the
                  streets, at the studio, or just hanging out, BIAS has your
                  back — literally and stylistically.
                </p>
              </div>

              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>
                  The name "BIAS" reflects both style and story. In fashion, a
                  bias cut follows the fabric's natural flow — smooth, edgy, and
                  distinct. In life, we all have our biases — shaped by what we
                  see, hear, and experience. Our goal? To challenge those. To
                  create clothing that doesn't follow trends but follows the
                  truth — your truth.
                </p>
                <p>
                  We're proud to represent a blend of Filipino and Japanese
                  influence, grounded in the values of respect, craft, and
                  community. Every drop is designed with intention, made for the
                  culture, and worn by those who aren't afraid to own their
                  narrative.
                </p>
              </div>
            </div>
          </div>

          {/* Final Statement */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-black to-gray-900 text-white rounded-2xl p-12 max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold mb-6">
                Thanks for being part of the journey.
              </h3>
              <p className="text-2xl text-gray-300">
                BIAS isn't just clothing. It's a statement.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-black text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to make your statement?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Explore our collection and find pieces that speak to your truth.
          </p>
          <button
            onClick={handleShopNow}
            className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Shop Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;
