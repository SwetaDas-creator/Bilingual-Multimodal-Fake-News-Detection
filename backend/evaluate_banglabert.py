import csv
import json
import urllib.error
import urllib.request
import uuid
from pathlib import Path

SAMPLES = json.loads(r'''[{"id":"R1","expected":"REAL","text":"ভারতের রিজার্ভ ব্যাঙ্ক দেশের মুদ্রাস্ফীতির পরিস্থিতি পর্যালোচনা করে আর্থিক নীতি নির্ধারণ করেছে। কেন্দ্রীয় ব্যাঙ্ক জানিয়েছে, মূল্যবৃদ্ধি নিয়ন্ত্রণ এবং অর্থনৈতিক স্থিতিশীলতা বজায় রাখা তাদের প্রধান লক্ষ্য। আগামী দিনে অর্থনৈতিক পরিস্থিতি অনুযায়ী নীতিগত সিদ্ধান্ত পুনর্বিবেচনা করা হবে।"},{"id":"R2","expected":"REAL","text":"আবহাওয়া দপ্তরের পূর্বাভাস অনুযায়ী, আগামী কয়েক দিনে পশ্চিমবঙ্গের কয়েকটি জেলায় বৃষ্টিপাতের সম্ভাবনা রয়েছে। উপকূলবর্তী অঞ্চলে ঝোড়ো হাওয়া বইতে পারে বলে সতর্কতা জারি করা হয়েছে। সাধারণ মানুষকে আবহাওয়ার সর্বশেষ আপডেট অনুসরণ করার পরামর্শ দেওয়া হয়েছে।"},{"id":"R3","expected":"REAL","text":"রাজ্যের সরকারি বিদ্যালয়গুলিতে শিক্ষার মান উন্নত করার লক্ষ্যে নতুন পরিকাঠামো গড়ে তোলার পরিকল্পনা নেওয়া হয়েছে। এর মধ্যে রয়েছে শ্রেণিকক্ষ সংস্কার, গ্রন্থাগারের উন্নয়ন এবং শিক্ষার্থীদের জন্য ডিজিটাল শিক্ষার সুবিধা বৃদ্ধি। সংশ্লিষ্ট দপ্তর পর্যায়ক্রমে এই প্রকল্প বাস্তবায়ন করবে।"},{"id":"R4","expected":"REAL","text":"রেল কর্তৃপক্ষ যাত্রী পরিষেবা উন্নত করার জন্য বিভিন্ন স্টেশনে পরিকাঠামো সংস্কারের কাজ শুরু করেছে। এই কাজের মধ্যে প্ল্যাটফর্মের উন্নয়ন, যাত্রীদের বসার ব্যবস্থা এবং নিরাপত্তা পরিকাঠামো আধুনিকীকরণ অন্তর্ভুক্ত রয়েছে। কাজ চলাকালীন কিছু ট্রেনের সময়সূচিতে সাময়িক পরিবর্তন হতে পারে।"},{"id":"R5","expected":"REAL","text":"স্বাস্থ্য দপ্তর সাধারণ মানুষের মধ্যে সংক্রামক রোগ সম্পর্কে সচেতনতা বাড়ানোর জন্য বিশেষ প্রচার কর্মসূচি শুরু করেছে। এই কর্মসূচিতে পরিচ্ছন্নতা বজায় রাখা, নিরাপদ পানীয় জল ব্যবহার এবং অসুস্থ হলে চিকিৎসকের পরামর্শ নেওয়ার বিষয়ে গুরুত্ব দেওয়া হয়েছে।"},{"id":"F1","expected":"FAKE","text":"সরকার ঘোষণা করেছে যে আগামীকাল থেকে দেশের প্রত্যেক নাগরিকের ব্যাংক অ্যাকাউন্টে ১ লক্ষ টাকা জমা দেওয়া হবে। এই টাকা পাওয়ার জন্য কোনও আবেদন করতে হবে না। শুধু একটি অজানা ওয়েবসাইটে নিজের আধার নম্বর ও ব্যাংকের তথ্য জমা দিলেই টাকা সরাসরি অ্যাকাউন্টে পৌঁছে যাবে।"},{"id":"F2","expected":"FAKE","text":"জরুরি বিজ্ঞপ্তি! আজ রাত ১২টার পর দেশের সমস্ত মোবাইল ফোন স্থায়ীভাবে বন্ধ হয়ে যাবে বলে জানা গেছে। ফোন চালু রাখতে হলে প্রত্যেক ব্যবহারকারীকে এই বার্তাটি ২৫ জনের কাছে পাঠাতে হবে। যারা এই বার্তা পাঠাবেন না, তাঁদের মোবাইল নম্বর চিরতরে বাতিল করে দেওয়া হবে।"},{"id":"F3","expected":"FAKE","text":"গবেষকরা দাবি করেছেন যে প্রতিদিন মাত্র দুই মিনিট একটি বিশেষ শব্দ শুনলে মানুষের স্মৃতিশক্তি দ্বিগুণ হয়ে যায়। তাঁদের মতে, এই পদ্ধতি ব্যবহার করলে কোনও পড়াশোনা ছাড়াই যে কেউ পরীক্ষায় সর্বোচ্চ নম্বর পেতে পারেন। খুব শীঘ্রই এই প্রযুক্তি বিনামূল্যে সবার জন্য চালু করা হবে।"},{"id":"F4","expected":"FAKE","text":"একটি নতুন সরকারি প্রকল্পের মাধ্যমে দেশের প্রত্যেক শিক্ষার্থীকে কোনও পরীক্ষা ছাড়াই প্রতি মাসে ২০,০০০ টাকা দেওয়া হবে বলে দাবি করা হয়েছে। আবেদন করার জন্য শিক্ষার্থীদের একটি অজানা লিঙ্কে ক্লিক করে ব্যাংকের পাসওয়ার্ড এবং ব্যক্তিগত তথ্য জমা দিতে বলা হয়েছে।"},{"id":"F5","expected":"FAKE","text":"সামাজিক মাধ্যমে একটি বার্তা ছড়িয়ে পড়েছে যে আগামীকাল থেকে পশ্চিমবঙ্গের সমস্ত জেলায় একটানা ৩০ দিন সূর্যের আলো দেখা যাবে না। বার্তাটিতে আরও দাবি করা হয়েছে যে এই ঘটনা আগে কখনও ঘটেনি এবং প্রশাসন ইতিমধ্যেই সমস্ত স্কুল ও কলেজ অনির্দিষ্টকালের জন্য বন্ধ করার নির্দেশ দিয়েছে।"}]''')
API = "http://127.0.0.1:8000/api/predict"
REPORTS = Path(__file__).resolve().parent / "reports"


def post_sample(text):
    boundary = "----CodexBoundary" + uuid.uuid4().hex
    parts = []
    for name, value in (("mode", "bangla-text"), ("language", "Bengali"), ("text", text)):
        parts.append((f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"\r\n\r\n{value}\r\n").encode("utf-8"))
    body = b"".join(parts) + f"--{boundary}--\r\n".encode()
    request = urllib.request.Request(API, data=body, headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=90) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        try: payload = json.loads(exc.read().decode("utf-8"))
        except Exception: payload = {"error": str(exc)}
        return exc.code, payload


def main():
    results = []
    for sample in SAMPLES:
        status, response = post_sample(sample["text"])
        expected = "likely_real" if sample["expected"] == "REAL" else "likely_fake"
        pred = response.get("verdict")
        confidence = response.get("confidence")
        row = {"sample_id": sample["id"], "expected_label": sample["expected"], "expected_verdict": expected,
               "predicted_label": ("REAL" if pred == "likely_real" else "FAKE" if pred == "likely_fake" else None),
               "verdict": pred, "confidence": confidence, "correct": pred == expected,
               "http_status": status, "model": response.get("model"), "language": response.get("language"),
               "mode": response.get("mode"), "explanation": response.get("explanation"), "model_response": response}
        results.append(row)
        print(f"{row['sample_id']} expected={sample['expected']} status={status} verdict={pred} confidence={confidence} model={row['model']}")
    valid = [r for r in results if r["http_status"] == 200 and r["predicted_label"]]
    y_true = [1 if r["expected_label"] == "REAL" else 0 for r in valid]
    y_pred = [1 if r["predicted_label"] == "REAL" else 0 for r in valid]
    try:
        from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
        metrics = {"accuracy": accuracy_score(y_true, y_pred), "precision": precision_score(y_true, y_pred, zero_division=0),
                   "recall": recall_score(y_true, y_pred, zero_division=0), "f1": f1_score(y_true, y_pred, zero_division=0),
                   "confusion_matrix_labels_0_FAKE_1_REAL": confusion_matrix(y_true, y_pred, labels=[0,1]).tolist(),
                   "metrics_library": "sklearn"}
    except ImportError:
        tp=sum(a==1 and b==1 for a,b in zip(y_true,y_pred)); tn=sum(a==0 and b==0 for a,b in zip(y_true,y_pred))
        fp=sum(a==0 and b==1 for a,b in zip(y_true,y_pred)); fn=sum(a==1 and b==0 for a,b in zip(y_true,y_pred)); n=len(valid)
        metrics={"accuracy":(tp+tn)/n if n else None,"precision":tp/(tp+fp) if tp+fp else 0.0,
                 "recall":tp/(tp+fn) if tp+fn else 0.0,"f1":2*tp/(2*tp+fp+fn) if 2*tp+fp+fn else 0.0,
                 "confusion_matrix_labels_0_FAKE_1_REAL":[[tn,fp],[fn,tp]],"metrics_library":"stdlib fallback (sklearn unavailable)"}
    correct=sum(r["correct"] for r in valid); total=len(SAMPLES)
    report={"total_samples":total,"successful_responses":len(valid),"correct_predictions":correct,"incorrect_predictions":len(valid)-correct,
            "accuracy_over_successful_responses":correct/len(valid) if valid else None,**metrics,"results":results,
            "limitation":"Ten synthetic samples with assigned expected labels; not independently verified news and not official or real-world test accuracy."}
    REPORTS.mkdir(parents=True,exist_ok=True)
    (REPORTS/"banglabert_evaluation.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
    with (REPORTS/"banglabert_evaluation.csv").open("w",newline="",encoding="utf-8-sig") as f:
        writer=csv.DictWriter(f,fieldnames=[k for k in results[0] if k!="model_response"]+ ["model_response"])
        writer.writeheader()
        for row in results:
            writer.writerow({**row,"model_response":json.dumps(row["model_response"],ensure_ascii=False)})
    print(json.dumps({k:v for k,v in report.items() if k!="results"},ensure_ascii=False,indent=2))
    print(f"CSV: {REPORTS/'banglabert_evaluation.csv'}")
    print(f"JSON: {REPORTS/'banglabert_evaluation.json'}")
    if len(valid) != total: raise SystemExit("One or more API samples failed; see saved reports.")

if __name__ == "__main__": main()
