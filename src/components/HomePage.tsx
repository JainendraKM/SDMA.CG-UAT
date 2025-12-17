
import React from 'react';
import { Header } from './Header';

interface HomePageProps {
  onLoginClick: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onLoginClick }) => {
  return (
    <>
      {/* Desktop View */}
      <div className="desktop-view-container font-['Tiro_Devanagari_Hindi']">
       
        <Header/>
        <div className="NavBarDV">
          <button onClick={onLoginClick} className="gzBtn" role="button" aria-pressed="true">
            लॉगिन
          </button>
        </div>

        <div className="main-content">
          <div className="sidebar-home">
            <div className="profile-card">
              <img src="images/cmphoto.png"                
                alt="Shri Vishnu Dev Sai" 
              />
              <h3>श्री विष्णु देव साय</h3>
              <p>माननीय मुख्यमंत्री छत्तीसगढ़ शासन</p>
            </div>
            <div className="profile-card">
              <img 
                src="images/trvarma.png" 
                alt="Shri Tankaram Verma" 
              />
              <h3>श्री टंकराम वर्मा</h3>
              <p>मंत्री, राजस्व एवं आपदा प्रबंधन, पुनर्वास, उच्‍च शिक्षा</p>
            </div>
          </div>
          <div className="table-section">
            <div>
              <div className="Press-Detail">
                <h5><b>उद्देश्य</b></h5>
                <p>आपदा प्रबंधन में इंसिडेंट रिस्पॉन्स पोर्टल का उद्देश्य प्राकृतिक या मानव निर्मित आपदाओं के दौरान रियल-टाइम रिपोर्टिंग, कोऑर्डिनेशन और कम्युनिकेशन के लिए एक सेंट्रलाइज्ड प्लेटफॉर्म के रूप में काम करना है। यह समय पर और प्रभावी प्रतिक्रिया सुनिश्चित करने, प्रभाव को कम करने और रिकवरी प्रयासों में सहायता करने के लिए तेजी से घटना लॉगिंग, संसाधन तैनाती, हितधारक सहयोग और स्थितिजन्य जागरूकता को सक्षम बनाता है। यह पोर्टल सटीक डेटा, प्रतिक्रिया ट्रैकिंग और आपदा के बाद के विश्लेषण और सुधार के लिए दस्तावेज़ीकरण प्रदान करके निर्णय लेने की क्षमता को बढ़ाता है।</p>
              </div>
            </div>
            <div>
              <div className="Press-Detail">
                <h5><b>विजन</b></h5>
                <p>रियल-टाइम आपदा घटना रिपोर्टिंग और प्रतिक्रिया समन्वय के लिए अग्रणी डिजिटल प्लेटफॉर्म बनना - आपातकालीन टीमों, सरकारी एजेंसियों और समुदायों को सटीक जानकारी, निर्बाध संचार और डेटा-संचालित आपदा प्रबंधन के माध्यम से तेजी से कार्य करने, नुकसान को कम करने और लचीलापन बनाने के लिए सशक्त बनाना।</p>
              </div>
            </div>
            <div>
              <div className="Press-Detail">
                <h5><b>मिशन</b></h5>
                <p>आपदा से संबंधित घटनाओं की समय पर रिपोर्टिंग, ट्रैकिंग और समन्वय के लिए एक विश्वसनीय और सुलभ प्लेटफॉर्म प्रदान करना। हमारा मिशन स्थितिजन्य जागरूकता बढ़ाना, त्वरित प्रतिक्रिया का समर्थन करना और आपातकालीन प्रतिक्रियाकर्ताओं, अधिकारियों और समुदायों के बीच सहयोग को सुविधाजनक बनाना है - अंततः प्रौद्योगिकी-संचालित समाधानों के माध्यम से आपदाओं के प्रभाव को कम करना और रिकवरी में तेजी लाना।</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="mobile-view-container font-['Tiro_Devanagari_Hindi']">
        <Header/>
        <div className="NavBarDV">
          <button onClick={onLoginClick} className="gzBtn" role="button" aria-pressed="true">
            लॉगिन
          </button>
        </div>
        <div className="mobile-profile-section">
          <div className="mobile-profile-card">
            <img 
                src="images/cmphoto.png" 
                alt="Shri Vishnu Dev Sai" 
            />
            <div className="mobile-profile-info">
              <h3>श्री विष्णु देव साय</h3>
              <p>माननीय मुख्यमंत्री <br /> छत्तीसगढ़ शासन</p>
            </div>
          </div>
          <div className="mobile-profile-card">
            <img 
                src="images/trvarma.png" 
                alt="Shri Tankaram Verma" 
            />
            <div className="mobile-profile-info">
              <h3>श्री टंकराम वर्मा</h3>
              <p>मंत्री, राजस्व एवं आपदा<br />प्रबंधन, पुनर्वास, उच्‍च शिक्षा</p>
            </div>
          </div>
        </div>
        <div className="table-section p-4">
          <div>
            <div className="Press-Detail">
              <h5><b>उद्देश्य</b></h5>
              <p>आपदा प्रबंधन में इंसिडेंट रिस्पॉन्स पोर्टल का उद्देश्य प्राकृतिक या मानव निर्मित आपदाओं के दौरान रियल-टाइम रिपोर्टिंग, कोऑर्डिनेशन और कम्युनिकेशन के लिए एक सेंट्रलाइज्ड प्लेटफॉर्म के रूप में काम करना है। यह समय पर और प्रभावी प्रतिक्रिया सुनिश्चित करने, प्रभाव को कम करने और रिकवरी प्रयासों में सहायता करने के लिए तेजी से घटना लॉगिंग, संसाधन तैनाती, हितधारक सहयोग और स्थितिजन्य जागरूकता को सक्षम बनाता है।</p>
            </div>
          </div>
          <div>
            <div className="Press-Detail">
              <h5><b>विजन</b></h5>
              <p>रियल-टाइम आपदा घटना रिपोर्टिंग और प्रतिक्रिया समन्वय के लिए अग्रणी डिजिटल प्लेटफॉर्म बनना - आपातकालीन टीमों, सरकारी एजेंसियों और समुदायों को सटीक जानकारी, निर्बाध संचार और डेटा-संचालित आपदा प्रबंधन के माध्यम से तेजी से कार्य करने, नुकसान को कम करने और लचीलापन बनाने के लिए सशक्त बनाना।</p>
            </div>
          </div>
          <div>
            <div className="Press-Detail">
              <h5><b>मिशन</b></h5>
              <p>आपदा से संबंधित घटनाओं की समय पर रिपोर्टिंग, ट्रैकिंग और समन्वय के लिए एक विश्वसनीय और सुलभ प्लेटफॉर्म प्रदान करना। हमारा मिशन स्थितिजन्य जागरूकता बढ़ाना, त्वरित प्रतिक्रिया का समर्थन करना और आपातकालीन प्रतिक्रियाकर्ताओं, अधिकारियों और समुदायों के बीच सहयोग को सुविधाजनक बनाना है।</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
