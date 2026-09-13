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

# 50-60 curated realistic Hinglish & English training examples per category
RAW_TRAINING_DATA = [
    # toilet_overflow (Sanitation Dept)
    ("Sector 12 mein toilet bahut kharab hai overflow ho raha hai", "toilet_overflow"),
    ("Toilet is overflowing in Sector 4 near Sangam gate", "toilet_overflow"),
    ("Shauchalay overflow ho gaya gandi badboo aa rahi hai", "toilet_overflow"),
    ("Urinal overflow dirty smell everywhere in sector 2", "toilet_overflow"),
    ("Sector 15 mobile toilet leakage and dirty water coming out", "toilet_overflow"),
    ("Patti 3 ke paas toilet block aur overflow ho gaya hai", "toilet_overflow"),
    ("Toilets are choked up and waste is spilling out", "toilet_overflow"),
    ("Sector 1 toilet complex choked flush not working waste overflowing", "toilet_overflow"),
    ("Ganga ghat ke paas toilet se paani aur waste bahar aa raha hai", "toilet_overflow"),
    ("Sector 8 sanitation block toilet overflow clean it immediately", "toilet_overflow"),
    ("Toilet me gandagi bahar aa rahi hai bhayanak badboo hai", "toilet_overflow"),
    ("Choked latrine in sector 10 pilgrim camp area overflowed", "toilet_overflow"),
    ("Shauchalay me toilet paper and human waste flooding", "toilet_overflow"),
    ("Public toilet block near VIP tent overflowed completely", "toilet_overflow"),
    ("Sector 11 ghat toilet overflow people cannot step inside", "toilet_overflow"),
    ("Dirty water overflowing from toilet cubicle 4", "toilet_overflow"),
    ("Bio toilet leak and overflow near food stall area", "toilet_overflow"),
    ("Toilet choke ho gaya sewage spill near Sector 5 camp", "toilet_overflow"),
    ("Toilet complex full dirty overflow condition urgent clean up", "toilet_overflow"),
    ("Latrine me flush nahi chal raha aur overflow ho raha hai", "toilet_overflow"),
    ("Sector 6 mela area toilet spilling sewage onto main road", "toilet_overflow"),
    ("Toilets overflowing severely in sector 14 parking", "toilet_overflow"),
    ("Toilet dirty water leaking out into walking passage", "toilet_overflow"),
    ("Shauchalay full ho chuka hai overflow ho raha hai", "toilet_overflow"),
    ("Severe sewage overflow from portable toilet unit 12", "toilet_overflow"),
    ("Choked drains inside toilet building spilling outside", "toilet_overflow"),
    ("Sector 3 temporary toilets completely choked overflowed", "toilet_overflow"),
    ("Toilet overflow due to blockage in sector 9 bridge side", "toilet_overflow"),
    ("Ganda paani toilet se nikal ke raste par aa gaya hai", "toilet_overflow"),
    ("Urinal choked and overflowing in public convenience center", "toilet_overflow"),

    # no_water (Water Supply Dept)
    ("Sector 5 tap water is completely stopped no water coming", "no_water"),
    ("Paani nahi aa raha tap me sector 12 camp area", "no_water"),
    ("Water supply cuts off at Sector 3 hand pump empty", "no_water"),
    ("Nal me paani band hai pilgrims sitting thirsty Sector 1", "no_water"),
    ("No water in drinking taps near Sangam bathing ghat", "no_water"),
    ("Paani ki tanki khali ho gayi sector 7 water tank empty", "no_water"),
    ("Drinking water kiosk running dry Sector 14", "no_water"),
    ("Water pipeline broken supply stopped in Sector 2", "no_water"),
    ("Paani bilkul nahi hai morning se nalke dry hain", "no_water"),
    ("No water in washroom basins for sanitation Sector 9", "no_water"),
    ("Sector 11 main water tank has no water supply", "no_water"),
    ("Nal band hai paani ki zaroorat hai jaldi paani bhejo", "no_water"),
    ("Dry water standpost near Sector 4 food zone", "no_water"),
    ("Pilgrims facing severe water scarcity no tap water Sector 6", "no_water"),
    ("Paani nahi aa raha toilet tank empty ho gaya", "no_water"),
    ("Water tanker required Sector 15 no water in taps", "no_water"),
    ("Taps are totally dry no drinking water available near pontoon bridge", "no_water"),
    ("Paani ki supply cut off hai last 4 hours se", "no_water"),
    ("No water in taps sector 8 volunteer camp", "no_water"),
    ("Subah se paani nahi aaya nal me sector 13", "no_water"),
    ("Water pipe leak led to complete water shutdown Sector 10", "no_water"),
    ("Drinking water point dry in sector 2 near police outpost", "no_water"),
    ("Paani ki problem hai sector 16 tap dry state", "no_water"),
    ("No water supply in ladies toilet complex Sector 7", "no_water"),
    ("Continuous water failure at water ATM Sector 1", "no_water"),
    ("Paani nahi mil raha log pyaase hain sector 5 ghat", "no_water"),
    ("Tap water pressure zero no water flowing Sector 4", "no_water"),
    ("Water tank empty send water tanker immediately Sector 12", "no_water"),
    ("Paani band hai nalke me dhabe ke paas sector 3", "no_water"),
    ("No water for drinking or washing in Sector 14 camp", "no_water"),

    # blocked_drain (Drainage & Sewage Dept)
    ("Nala jam ho gaya ganda paani raste par bah raha hai", "blocked_drain"),
    ("Drain is blocked and dirty black water accumulating in Sector 8", "blocked_drain"),
    ("Naali choked hai Sector 2 main market road near shop 45", "blocked_drain"),
    ("Open drain overflowing with slush and sewage Sector 10", "blocked_drain"),
    ("Nala block hone se paani jam gaya hai raste pe", "blocked_drain"),
    ("Blocked storm water drain causing flooding Sector 15", "blocked_drain"),
    ("Sewage drain choked mud and plastic blocking flow Sector 6", "blocked_drain"),
    ("Naali se gandi badboo aur stagnant water jam ho raha hai", "blocked_drain"),
    ("Drain choke in Sector 1 near main bathing area stairs", "blocked_drain"),
    ("Choked nala spilling wastewater onto pedestrian pathway", "blocked_drain"),
    ("Sector 12 drain clogged by garbage water spreading", "blocked_drain"),
    ("Naali block ho gayi hai paani aage nahi jaa raha", "blocked_drain"),
    ("Sewage line blocked in Sector 7 pilgrim walkway", "blocked_drain"),
    ("Deep drain choked with waste material water overflowing", "blocked_drain"),
    ("Nala jam problem dirty water logged near Sector 3 crossroad", "blocked_drain"),
    ("Blocked drainage pipe near sanitation camp Sector 4", "blocked_drain"),
    ("Ganda paani naali se nikal ke sadak pe bhar raha hai", "blocked_drain"),
    ("Clogged drain causing mosquito breeding Sector 9", "blocked_drain"),
    ("Naali saaf karo clogged water overflowing on road Sector 11", "blocked_drain"),
    ("Drainage line chocking in sector 14 near pontoon 2", "blocked_drain"),
    ("Nala water overflow sector 5 main road blocked", "blocked_drain"),
    ("Dirty black drain water stagnant near food stalls Sector 13", "blocked_drain"),
    ("Naali jam hone se aane jane me dikkat hai Sector 8", "blocked_drain"),
    ("Choked drain pipe flooding tent entry Sector 16", "blocked_drain"),
    ("Main nala blocked garbage trapped inside Sector 2", "blocked_drain"),
    ("Overflowing open drain near medical counter Sector 1", "blocked_drain"),
    ("Naali block hai ganda paani dhabe ke paas jama hai", "blocked_drain"),
    ("Waterlogging due to choked drain line Sector 6", "blocked_drain"),
    ("Sewage water accumulating from blocked nala Sector 10", "blocked_drain"),
    ("Naali saaf karvao drainage choke hai Sector 7", "blocked_drain"),

    # waste_bin_full (Solid Waste Management)
    ("Dustbin completely full garbage falling outside Sector 4", "waste_bin_full"),
    ("Kachre ka dibba bhar gaya hai waste sadak pe pada hai", "waste_bin_full"),
    ("Trash bin overflowing with plastic plates Sector 1", "waste_bin_full"),
    ("Kachra bin full ho chuka hai koi utha nahi raha Sector 9", "waste_bin_full"),
    ("Garbage container overfilled heaps of garbage Sector 12", "waste_bin_full"),
    ("Kachra peda ho raha hai bin full waste everywhere Sector 3", "waste_bin_full"),
    ("Solid waste bin full outside food zone Sector 6", "waste_bin_full"),
    ("Kachre ka dher laga hai dustbin bhara hua hai Sector 15", "waste_bin_full"),
    ("Trash bin choked overflowing with garbage bags Sector 2", "waste_bin_full"),
    ("Dustbin overflow near Sangam main gate clear it", "waste_bin_full"),
    ("Kachra bin overflow ho gaya hai makkhiyan aa rahi hain", "waste_bin_full"),
    ("Waste collection bin full plastic food wrappers everywhere Sector 8", "waste_bin_full"),
    ("Kachredan bhar gaya hai Sector 11 camp area", "waste_bin_full"),
    ("Overfilled waste container smells terrible Sector 7", "waste_bin_full"),
    ("Dustbin full waste scattered all over foot path Sector 5", "waste_bin_full"),
    ("Kachra uthao bin overflowing in Sector 14 near bridge", "waste_bin_full"),
    ("Huge pile of trash bin capacity exceeded Sector 10", "waste_bin_full"),
    ("Kachre ki gaadi bhejo dustbins are totally full Sector 13", "waste_bin_full"),
    ("Waste bin over capacity garbage spilling onto road Sector 16", "waste_bin_full"),
    ("Kachra container overflow ho raha hai Sector 1", "waste_bin_full"),
    ("Garbage bin full near bus stand drop point Sector 4", "waste_bin_full"),
    ("Dustbins dry waste full food waste rotting Sector 3", "waste_bin_full"),
    ("Kachre ka dhabba overflow waste disposal needed Sector 12", "waste_bin_full"),
    ("Trash bin full foul smell of garbage Sector 6", "waste_bin_full"),
    ("Kachra saaf karwao bin overfilled Sector 9", "waste_bin_full"),
    ("Large garbage bin overflowing in Sector 2 market", "waste_bin_full"),
    ("Kachra sadak par aane laga hai dustbin full ho gaya", "waste_bin_full"),
    ("Waste bin full needs immediate emptying Sector 8", "waste_bin_full"),
    ("Kachradan overflowing Sector 15 near VIP parking", "waste_bin_full"),
    ("Dustbin overfilled with disposable tea cups Sector 7", "waste_bin_full"),

    # broken_handwashing (Public Health Dept)
    ("Handwashing tap is broken water spraying everywhere Sector 3", "broken_handwashing"),
    ("Sabun aur handwash basin tut gaya hai tap broken Sector 1", "broken_handwashing"),
    ("Hand wash sink pipe leak and tap broken Sector 8", "broken_handwashing"),
    ("Handwashing station tap damaged no soap available Sector 12", "broken_handwashing"),
    ("Handwash basin tuta hua hai paani leak ho raha hai Sector 5", "broken_handwashing"),
    ("Broken tap at handwashing counter Sector 14 food zone", "broken_handwashing"),
    ("Hand wash stand broken faucet missing Sector 2", "broken_handwashing"),
    ("Sabun dhoone ka stand tut gaya hai basin leaking Sector 9", "broken_handwashing"),
    ("Handwashing sink damaged basin choked Sector 6", "broken_handwashing"),
    ("Handwash tap broken continuous water waste Sector 11", "broken_handwashing"),
    ("Hand wash point tap handle broken unusable Sector 4", "broken_handwashing"),
    ("Handwashing basin broken near public dining area Sector 7", "broken_handwashing"),
    ("Tuta hua handwash stand paani gir raha hai Sector 15", "broken_handwashing"),
    ("Handwash station faucet broken no water coming out properly", "broken_handwashing"),
    ("Sabun rakhne wala basin tut gaya hai faucet loose Sector 10", "broken_handwashing"),
    ("Handwashing unit broken taps missing Sector 13", "broken_handwashing"),
    ("Hand wash basin pipe broken wastewater on ground Sector 1", "broken_handwashing"),
    ("Tuta handwash basin replace karo Sector 16", "broken_handwashing"),
    ("Handwashing kiosk damaged taps leaking continuously Sector 3", "broken_handwashing"),
    ("Hand wash faucet broken at sanitation station Sector 12", "broken_handwashing"),
    ("Handwash counter broken basin cracked Sector 2", "broken_handwashing"),
    ("Sabun ka basin tut gaya pipe se paani bah raha hai Sector 8", "broken_handwashing"),
    ("Damaged handwashing station near main toilet block Sector 5", "broken_handwashing"),
    ("Hand wash tap disconnected water gushing Sector 9", "broken_handwashing"),
    ("Tuta hua faucet handwash counter pe Sector 4", "broken_handwashing"),
    ("Handwashing sink leak and broken valve Sector 6", "broken_handwashing"),
    ("Handwash point broken unusable condition Sector 14", "broken_handwashing"),
    ("Sabun aur paani ka handwash station vandalized/damaged Sector 7", "broken_handwashing"),
    ("Handwashing station water pipe broken leaking muddy water Sector 11", "broken_handwashing"),
    ("Broken handwash faucet near pilgrim rest house Sector 10", "broken_handwashing")
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

        # Save to disk
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
