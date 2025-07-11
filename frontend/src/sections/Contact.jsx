import EmailIcon from "@mui/icons-material/Email";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import CallEndIcon from "@mui/icons-material/CallEnd";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const Contact = () => {
  return (
    <section className="py-16 px-4 ">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-16">
          Contact Us
        </h2>

        <div className="flex flex-col md:flex-row gap-12 items-center">
          {/* Left Section - Contact Information */}
          <div className="flex-1 space-y-8">
            {/* Company Info */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                  <LocationOnIcon className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    Bias Clothing
                  </h3>
                  <p className="text-gray-600">Home Office</p>
                </div>
              </div>

              <div className="space-y-2 text-gray-700">
                <p className="font-medium">
                  P1 B2 L4 St. John Street, Sto. Nino Village,
                </p>
                <p className="font-medium">Tunasan, Muntinlupa City</p>
              </div>
            </div>

            {/* Contact Methods */}
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                For Questions and Inquiries
              </h3>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <EmailIcon className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Email</p>
                    <a
                      href="mailto:info@biasclothing.com"
                      className="text-gray-800 font-medium hover:text-blue-600 transition-colors duration-200"
                    >
                      info@biasclothing.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CallEndIcon className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Landline</p>
                    <a
                      href="tel:+6288888888"
                      className="text-gray-800 font-medium hover:text-green-600 transition-colors duration-200"
                    >
                      (02) 8888 8888
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <PhoneAndroidIcon className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Mobile</p>
                    <a
                      href="tel:+639123456789"
                      className="text-gray-800 font-medium hover:text-purple-600 transition-colors duration-200"
                    >
                      (+63) 912 345 6789
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Logo and Visual */}
          <div className="flex-1 flex flex-col items-center">
            <div className="bg-white p-3 rounded-3xl shadow-xl">
              <img
                src="/src/images/bias_logo2.png"
                alt="Bias Clothing Logo"
                className="w-72 h-auto object-contain"
              />
            </div>

            {/* Call to Action */}
            <div className="mt-8 text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Ready to Connect?
              </h3>
              <p className="text-gray-600 mb-6 max-w-md">
                We'd love to hear from you. Send us a message and we'll respond
                as soon as possible.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:info@biasclothing.com"
                  className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <EmailIcon />
                  Send Email
                </a>
                <a
                  href="tel:+639123456789"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <PhoneAndroidIcon />
                  Call Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
