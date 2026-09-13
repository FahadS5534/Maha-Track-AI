import os
import pickle
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, classification_report

MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "trained_model.pkl")

CATEGORY_DEPARTMENTS = {
    "toilet_overflow": "Sanitation Dept",
    "no_water": "Water Supply Dept",
    "blocked_drain": "Drainage & Sewage Dept",
    "waste_bin_full": "Solid Waste Management",
    "broken_handwashing": "Public Health Dept"
}

# Curated realistic Hinglish & English training examples centered on Nashik Simhastha Kumbh Mela
RAW_TRAINING_DATA = [
    # toilet_overflow (Sanitation Dept)
    ("Ramkund Panchavati mein toilet bahut kharab hai overflow ho raha hai", "toilet_overflow"),
    ("Toilet is overflowing in Sector 4 near Kushavart Kund Trimbakeshwar", "toilet_overflow"),
    ("Shauchalay overflow ho gaya gandi badboo aa rahi hai Tapovan Sadhugram", "toilet_overflow"),
    ("Urinal overflow dirty smell everywhere in Kalaram Temple sector", "toilet_overflow"),
    ("Sector 15 mobile toilet leakage and dirty water coming out Nashik Road", "toilet_overflow"),
    ("Gauri Patangan ke paas toilet block aur overflow ho gaya hai", "toilet_overflow"),
    ("Toilets are choked up and waste is spilling out Panchavati ghat", "toilet_overflow"),
    ("Sector 1 toilet complex choked flush not working waste overflowing Ramkund", "toilet_overflow"),
    ("Godavari ghat ke paas toilet se paani aur waste bahar aa raha hai", "toilet_overflow"),
    ("Ahilyabai Holkar bridge sanitation block toilet overflow clean it immediately", "toilet_overflow"),
    ("Toilet me gandagi bahar aa rahi hai bhayanak badboo hai Sita Gufa side", "toilet_overflow"),
    ("Choked latrine in Tapovan pilgrim camp area overflowed", "toilet_overflow"),
    ("Shauchalay me toilet paper and human waste flooding Trimbak road", "toilet_overflow"),
    ("Public toilet block near VIP tent Godavari riverfront overflowed completely", "toilet_overflow"),
    ("Nilgiri Baug bus stand toilet overflow people cannot step inside", "toilet_overflow"),
    ("Dirty water overflowing from toilet cubicle near Kapaleshwar temple", "toilet_overflow"),
    ("Bio toilet leak and overflow near Gangapur food plaza area", "toilet_overflow"),
    ("Toilet choke ho gaya sewage spill near Brahmagiri foothills camp", "toilet_overflow"),
    ("Toilet complex full dirty overflow condition urgent clean up Talkuteshwar", "toilet_overflow"),
    ("Latrine me flush nahi chal raha aur overflow ho raha hai Ramkund", "toilet_overflow"),
    ("Panchavati mela area toilet spilling sewage onto main road", "toilet_overflow"),
    ("Toilets overflowing severely in Tapovan Sadhugram parking", "toilet_overflow"),
    ("Toilet dirty water leaking out into Godavari walking passage", "toilet_overflow"),
    ("Shauchalay full ho chuka hai overflow ho raha hai Trimbakeshwar", "toilet_overflow"),
    ("Severe sewage overflow from portable toilet unit near Holkar bridge", "toilet_overflow"),
    ("Choked drains inside Ramkund toilet building spilling outside", "toilet_overflow"),
    ("Temporary toilets near Sita Gufa completely choked overflowed", "toilet_overflow"),
    ("Toilet overflow due to blockage in Sector 13 Nashik control room side", "toilet_overflow"),
    ("Ganda paani toilet se nikal ke raste par aa gaya hai Panchavati", "toilet_overflow"),
    ("Urinal choked and overflowing in Kushavart Kund convenience center", "toilet_overflow"),

    # no_water (Water Supply Dept)
    ("Ramkund tap water is completely stopped no water coming", "no_water"),
    ("Paani nahi aa raha tap me Tapovan Sadhugram camp area", "no_water"),
    ("Water supply cuts off at Trimbakeshwar Kushavart Kund hand pump empty", "no_water"),
    ("Nal me paani band hai pilgrims sitting thirsty Kalaram temple", "no_water"),
    ("No water in drinking taps near Godavari bathing ghat Panchavati", "no_water"),
    ("Paani ki tanki khali ho gayi Nilgiri Baug water tank empty", "no_water"),
    ("Drinking water kiosk running dry Sector 14 Gangapur road", "no_water"),
    ("Water pipeline broken supply stopped in Sita Gufa sector", "no_water"),
    ("Paani bilkul nahi hai morning se nalke dry hain Ramkund ghat", "no_water"),
    ("No water in washroom basins for sanitation Kapaleshwar temple", "no_water"),
    ("Sector 11 VVIP Tent City Godavari main water tank has no water supply", "no_water"),
    ("Nal band hai paani ki zaroorat hai jaldi paani bhejo Tapovan", "no_water"),
    ("Dry water standpost near Food Plaza Gangapur road", "no_water"),
    ("Pilgrims facing severe water scarcity no tap water Trimbakeshwar", "no_water"),
    ("Paani nahi aa raha toilet tank empty ho gaya Panchavati", "no_water"),
    ("Water tanker required Sector 15 Nashik Road station no water in taps", "no_water"),
    ("Taps are totally dry no drinking water available near Ahilyabai bridge", "no_water"),
    ("Paani ki supply cut off hai last 4 hours se Gauri Patangan", "no_water"),
    ("No water in taps volunteer camp Brahmagiri foothills", "no_water"),
    ("Subah se paani nahi aaya nal me Talkuteshwar sector", "no_water"),
    ("Water pipe leak led to complete water shutdown Sadhugram sector 2", "no_water"),
    ("Drinking water point dry in sector 13 near police outpost Panchavati", "no_water"),
    ("Paani ki problem hai Trimbak road entry hub tap dry state", "no_water"),
    ("No water supply in ladies toilet complex Ramkund", "no_water"),
    ("Continuous water failure at water ATM Godavari riverfront", "no_water"),
    ("Paani nahi mil raha log pyaase hain Tapovan ghat", "no_water"),
    ("Tap water pressure zero no water flowing Kalaram temple side", "no_water"),
    ("Water tank empty send water tanker immediately Kushavart Kund", "no_water"),
    ("Paani band hai nalke me dhabe ke paas Panchavati", "no_water"),
    ("No water for drinking or washing in Sadhugram camp", "no_water"),

    # blocked_drain (Drainage & Sewage Dept)
    ("Nala jam ho gaya ganda paani raste par bah raha hai Ramkund", "blocked_drain"),
    ("Drain is blocked and dirty black water accumulating in Tapovan", "blocked_drain"),
    ("Naali choked hai Panchavati main market road near shop 45", "blocked_drain"),
    ("Open drain overflowing with slush and sewage Trimbakeshwar road", "blocked_drain"),
    ("Nala block hone se paani jam gaya hai raste pe Kalaram temple", "blocked_drain"),
    ("Blocked storm water drain causing flooding Nilgiri Baug", "blocked_drain"),
    ("Sewage drain choked mud and plastic blocking flow Sita Gufa", "blocked_drain"),
    ("Naali se gandi badboo aur stagnant water jam ho raha hai Godavari ghat", "blocked_drain"),
    ("Drain choke in Sector 1 near main Ramkund bathing area stairs", "blocked_drain"),
    ("Choked nala spilling wastewater onto pedestrian pathway Tapovan", "blocked_drain"),
    ("Sector 12 Trimbak road drain clogged by garbage water spreading", "blocked_drain"),
    ("Naali block ho gayi hai paani aage nahi jaa raha Kapaleshwar", "blocked_drain"),
    ("Sewage line blocked in Kushavart Kund pilgrim walkway", "blocked_drain"),
    ("Deep drain choked with waste material water overflowing Holkar bridge", "blocked_drain"),
    ("Nala jam problem dirty water logged near Gauri Patangan crossroad", "blocked_drain"),
    ("Blocked drainage pipe near sanitation camp Sadhugram", "blocked_drain"),
    ("Ganda paani naali se nikal ke sadak pe bhar raha hai Gangapur road", "blocked_drain"),
    ("Clogged drain causing mosquito breeding Nashik Road station area", "blocked_drain"),
    ("Naali saaf karo clogged water overflowing on road Talkuteshwar", "blocked_drain"),
    ("Drainage line chocking near Brahmagiri foothills Trimbak", "blocked_drain"),
    ("Nala water overflow Panchavati main road blocked", "blocked_drain"),
    ("Dirty black drain water stagnant near food stalls Tapovan", "blocked_drain"),
    ("Naali jam hone se aane jane me dikkat hai Ramkund ghat side", "blocked_drain"),
    ("Choked drain pipe flooding tent entry VVIP Tent City Godavari", "blocked_drain"),
    ("Main nala blocked garbage trapped inside Kalaram temple road", "blocked_drain"),
    ("Overflowing open drain near medical counter Kushavart Kund", "blocked_drain"),
    ("Naali block hai ganda paani dhabe ke paas jama hai Sita Gufa", "blocked_drain"),
    ("Waterlogging due to choked drain line Holkar bridge area", "blocked_drain"),
    ("Sewage water accumulating from blocked nala Nilgiri Baug", "blocked_drain"),
    ("Naali saaf karvao drainage choke hai Panchavati ghat", "blocked_drain"),

    # waste_bin_full (Solid Waste Management)
    ("Dustbin completely full garbage falling outside Ramkund ghat", "waste_bin_full"),
    ("Kachre ka dibba bhar gaya hai waste sadak pe pada hai Tapovan", "waste_bin_full"),
    ("Trash bin overflowing with plastic plates Kalaram temple", "waste_bin_full"),
    ("Kachra bin full ho chuka hai koi utha nahi raha Trimbakeshwar", "waste_bin_full"),
    ("Garbage container overfilled heaps of garbage Panchavati", "waste_bin_full"),
    ("Kachra peda ho raha hai bin full waste everywhere Sita Gufa", "waste_bin_full"),
    ("Solid waste bin full outside food zone Gangapur road", "waste_bin_full"),
    ("Kachre ka dher laga hai dustbin bhara hua hai Nilgiri Baug", "waste_bin_full"),
    ("Trash bin choked overflowing with garbage bags Holkar bridge", "waste_bin_full"),
    ("Dustbin overflow near Ramkund main gate clear it", "waste_bin_full"),
    ("Kachra bin overflow ho gaya hai makkhiyan aa rahi hain Gauri Patangan", "waste_bin_full"),
    ("Waste collection bin full plastic food wrappers everywhere Kapaleshwar", "waste_bin_full"),
    ("Kachredan bhar gaya hai Tapovan Sadhugram camp area", "waste_bin_full"),
    ("Overfilled waste container smells terrible Kushavart Kund", "waste_bin_full"),
    ("Dustbin full waste scattered all over foot path Godavari riverfront", "waste_bin_full"),
    ("Kachra uthao bin overflowing near Panchavati control room", "waste_bin_full"),
    ("Huge pile of trash bin capacity exceeded Nashik Road station", "waste_bin_full"),
    ("Kachre ki gaadi bhejo dustbins are totally full Brahmagiri foothills", "waste_bin_full"),
    ("Waste bin over capacity garbage spilling onto road Trimbak road", "waste_bin_full"),
    ("Kachra container overflow ho raha hai Sector 1 Ramkund", "waste_bin_full"),
    ("Garbage bin full near bus stand drop point Nilgiri Baug", "waste_bin_full"),
    ("Dustbins dry waste full food waste rotting Kalaram temple", "waste_bin_full"),
    ("Kachre ka dhabba overflow waste disposal needed Talkuteshwar", "waste_bin_full"),
    ("Trash bin full foul smell of garbage Tapovan sector 2", "waste_bin_full"),
    ("Kachra saaf karwao bin overfilled Panchavati ghat", "waste_bin_full"),
    ("Large garbage bin overflowing in Holkar bridge market", "waste_bin_full"),
    ("Kachra sadak par aane laga hai dustbin full ho gaya Sita Gufa", "waste_bin_full"),
    ("Waste bin full needs immediate emptying Kushavart Kund", "waste_bin_full"),
    ("Kachradan overflowing near VVIP Tent City Godavari", "waste_bin_full"),
    ("Dustbin overfilled with disposable tea cups Ramkund", "waste_bin_full"),

    # broken_handwashing (Public Health Dept)
    ("Handwashing tap is broken water spraying everywhere Ramkund ghat", "broken_handwashing"),
    ("Sabun aur handwash basin tut gaya hai tap broken Panchavati", "broken_handwashing"),
    ("Hand wash sink pipe leak and tap broken Tapovan Sadhugram", "broken_handwashing"),
    ("Handwashing station tap damaged no soap available Kalaram temple", "broken_handwashing"),
    ("Handwash basin tuta hua hai paani leak ho raha hai Trimbakeshwar", "broken_handwashing"),
    ("Broken tap at handwashing counter Gangapur road food zone", "broken_handwashing"),
    ("Hand wash stand broken faucet missing Sita Gufa", "broken_handwashing"),
    ("Sabun dhoone ka stand tut gaya hai basin leaking Kapaleshwar", "broken_handwashing"),
    ("Handwashing sink damaged basin choked Kushavart Kund", "broken_handwashing"),
    ("Handwash tap broken continuous water waste Holkar bridge", "broken_handwashing"),
    ("Hand wash point tap handle broken unusable Gauri Patangan", "broken_handwashing"),
    ("Handwashing basin broken near public dining area Nilgiri Baug", "broken_handwashing"),
    ("Tuta hua handwash stand paani gir raha hai Talkuteshwar", "broken_handwashing"),
    ("Handwash station faucet broken no water coming out properly Ramkund", "broken_handwashing"),
    ("Sabun rakhne wala basin tut gaya hai faucet loose Tapovan", "broken_handwashing"),
    ("Handwashing unit broken taps missing Nashik Road station", "broken_handwashing"),
    ("Hand wash basin pipe broken wastewater on ground Brahmagiri foothills", "broken_handwashing"),
    ("Tuta handwash basin replace karo Panchavati control room", "broken_handwashing"),
    ("Handwashing kiosk damaged taps leaking continuously Godavari riverfront", "broken_handwashing"),
    ("Hand wash faucet broken at sanitation station Kushavart Kund", "broken_handwashing"),
    ("Handwash counter broken basin cracked Kalaram temple", "broken_handwashing"),
    ("Sabun ka basin tut gaya pipe se paani bah raha hai Holkar bridge", "broken_handwashing"),
    ("Damaged handwashing station near main toilet block Tapovan", "broken_handwashing"),
    ("Hand wash tap disconnected water gushing Ramkund", "broken_handwashing"),
    ("Tuta hua faucet handwash counter pe Sita Gufa", "broken_handwashing"),
    ("Handwashing sink leak and broken valve Kapaleshwar", "broken_handwashing"),
    ("Handwash point broken unusable condition Trimbak road", "broken_handwashing"),
    ("Sabun aur paani ka handwash station damaged Gangapur road", "broken_handwashing"),
    ("Handwashing station water pipe broken leaking muddy water Nilgiri Baug", "broken_handwashing"),
    ("Broken handwash faucet near pilgrim rest house Trimbakeshwar", "broken_handwashing")
]

class TextClassifier:
    def __init__(self):
        self.pipeline = None
        self.metrics = {"accuracy": 0.0, "f1_score": 0.0, "samples_count": 0}
        self.is_trained = False

    def train(self):
        texts, labels = zip(*RAW_TRAINING_DATA)
        X_train, X_test, y_train, y_test = train_test_split(
            texts, labels, test_size=0.2, random_state=42, stratify=labels
        )

        self.pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(ngram_range=(1, 2), min_df=1, sublinear_tf=True)),
            ('clf', LogisticRegression(C=1.5, max_iter=200))
        ])

        self.pipeline.fit(X_train, y_train)

        preds = self.pipeline.predict(X_test)
        acc = float(accuracy_score(y_test, preds))
        f1 = float(f1_score(y_test, preds, average='macro'))

        self.metrics = {
            "accuracy": round(acc, 4),
            "f1_score": round(f1, 4),
            "samples_count": len(RAW_TRAINING_DATA),
            "train_size": len(X_train),
            "test_size": len(X_test)
        }
        self.is_trained = True

        try:
            with open(MODEL_PATH, "wb") as f:
                pickle.dump({"pipeline": self.pipeline, "metrics": self.metrics}, f)
        except Exception as e:
            print(f"Warning: Failed to save model: {e}")

        return self.metrics

    def load_or_train(self):
        if os.path.exists(MODEL_PATH):
            try:
                with open(MODEL_PATH, "rb") as f:
                    data = pickle.load(f)
                    self.pipeline = data["pipeline"]
                    self.metrics = data["metrics"]
                    self.is_trained = True
                    return self.metrics
            except Exception:
                pass
        return self.train()

    def predict(self, text: str):
        if not self.is_trained or self.pipeline is None:
            self.load_or_train()

        probs = self.pipeline.predict_proba([text])[0]
        classes = self.pipeline.classes_
        top_idx = int(np.argmax(probs))
        predicted_category = classes[top_idx]
        confidence = float(probs[top_idx])

        department = CATEGORY_DEPARTMENTS.get(predicted_category, "Sanitation Dept")

        return {
            "category": predicted_category,
            "department": department,
            "confidence": round(confidence, 3)
        }

classifier_instance = TextClassifier()
