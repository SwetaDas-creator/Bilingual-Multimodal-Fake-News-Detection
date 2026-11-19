# BanglaBERT dataset audit

- Source: `C:\Users\Sweta Das\Downloads\All60Kdataset.csv`; read-only, source unchanged.
- Rows: 61,581; raw columns: `['', 'Headline', 'Content', 'Label']`.
- Empty values: Headline 0; Content 1; Label 0.
- Label counts: 0=FAKE 12,903; 1=REAL 48,678; other 0.

| Field | Repeated groups | Excess rows | Unique nonempty values |
|---|---:|---:|---:|
| Headline | 6,669 | 8,022 | 53,559 |
| Content | 3,313 | 3,717 | 57,863 |
| Combined headline + content | 3,154 | 3,419 | 58,162 |

- Conflicting combined text groups: 1,861; rows in groups: 3,726.
- Formatting-insensitive cross-label groups: 1,910.
- Same content, different headlines, conflicting labels: 130.
- After combined exact deduplication: 58,162 unique records. Excluding each unresolved conflicting text group leaves 56,301; no relabeling or deletion performed.

## Method

- Unicode NFKC, casefold, remove Unicode format marks (including zero-width), collapse whitespace; punctuation retained for exact keys. Combined key uses normalized Headline + literal `[SEP]` + normalized Content. SHA-256 digests index normalized keys; empty field values are excluded from field duplicate groups.
- Separate formatting key also removes punctuation, separators, and whitespace. This only flags possible formatting variants; it is not the primary duplicate definition. Group counts are repeated keys; excess rows are occurrences after first.
- Near-duplicate count: NOT ESTABLISHED. A similarity scan was attempted but exceeded practical runtime at this dataset size. No near-duplicate result is claimed; MinHash/LSH or indexed n-gram similarity plus manual review is recommended.

## Duplicate examples (previews)
- rows [1966, 4291, 5934, 8101, 10347, 12290, 14389, 16695], labels ['1', '1', '1', '1', '1', '1', '1', '1']; headline 'টিভিতে আজকের খেলা'; content 'ক্রিকেট এশিয়া কাপ বাংলাদেশ-আফগানিস্তান সরাসরি, বিকেল ৫-৩০ মিনিট, মাছরাঙা, স্টার স্পোর্টস ওয়ান ও স্টার স্পোর্টস সিলেক্ট ও'.
- rows [246, 1708, 4059, 7907, 10040, 12088, 14178, 16495], labels ['1', '1', '1', '1', '1', '1', '1', '1']; headline 'আজকের ভাগ্যচক্র'; content 'আজকের এই দিনে জন্মগ্রহণ করায় পাশ্চাত্যমতে আপনি কন্যা রাশির জাতব্যক্তি। আপনার ওপর আজ বুদ্ধির দেবতা বুধ, গ্রহপিতা রবি ও দে'.
- rows [30056, 30064, 30065, 30081, 30086, 30109, 30141, 30153], labels ['1', '1', '1', '1', '1', '1', '1', '1']; headline 'সিরাজগঞ্জে যুবলীগ নেতাকে কুপিয়ে হত্যা'; content 'সিরাজগঞ্জ পৌর এলাকায় গোলাম মোস্তফা ওরফে বোম মোস্তফা (৪৫) নামে এক যুবলীগ নেতাকে কুপিয়ে হত্যা করেছে দুর্বৃত্তরা। বুধবার সক'.
- rows [2036, 4423, 5931, 8132, 10334, 14417, 21162, 23281], labels ['1', '1', '1', '1', '1', '1', '1', '1']; headline 'রাশিফলে জেনে নিন কেমন যাবে আজকের দিনটি'; content 'ধনু (23 Nov - 21 Dec) পুরনো কোনো আত্মীয়র সঙ্গে যোগাযোগ হতে পারে। বাড়িতে অতিথি সমাগম হতে পারে। আপ্যায়নের জন্য ব্যয় বৃদ্ধি'.
- rows [9054, 9062, 9063, 9109, 9132, 9209, 9215, 9252], labels ['1', '1', '1', '1', '1', '1', '1', '1']; headline 'টস জিতে ব্যাটিংয়ে বাংলাদেশ'; content 'বাংলাদেশের জন্য মাস্ট উইন ম্যাচ। জিতলে টিকে থাকবে, হারলে বিদায়টা ৯৯.৯৯ ভাগ নিশ্চিত। বাকি ০.০১ ভাগ বিভিন্ন হিসাব-নিকাশের '.

## Conflicting combined examples (previews)
- rows [896, 1540, 59036], labels ['1', '1', '0']; headline 'সুপার ফোরের সূচি বদলে ক্ষুব্ধ মাশরাফি'; content 'বাংলাদেশ এশিয়া কাপে তাদের গ্রুপ পর্বের শেষ ম্যাচ খেলবে বৃহস্পতিবার আফগানিস্তানের বিপক্ষে। ওই ম্যাচ দিয়েই এশিয়া কাপের গ্র'.
- rows [4047, 5980, 57214], labels ['1', '1', '0']; headline 'জাসদকে নিয়ে দুশ্চিন্তায় আ’লীগ মাঠে নেই বিএনপি'; content 'একাদশ জাতীয় সংসদ নির্বাচনের কয়েক মাস বাকি থাকলেও বিএনপির দুর্গ হিসেবে পরিচিত ফেনী-১ নির্বাচনী এলাকায় মাঠে তৎপর নয় বিএনপি'.
- rows [4196, 4331, 59986], labels ['1', '1', '0']; headline 'রোহিঙ্গা ফেরতের প্রস্তাব জাতিসংঘে দেবেন প্রধানমন্ত্রী'; content 'জাতিসংঘ সাধারণ পরিষদের অধিবেশনে রোহিঙ্গা প্রত্যাবাসনের সুনির্দিষ্ট প্রস্তাব তুলে ধরবেন প্রধানমন্ত্রী শেখ হাসিনা। আগামী ২'.
- rows [4280, 5259, 61206], labels ['1', '1', '0']; headline '‘জননী’ ভয়ংকর'; content 'মেহেরা আক্তার (৩৫) নিজের সন্তানকে প্রথমে খাবারের সঙ্গে কীটনাশক মিশিয়ে খাওয়াতে শুরু করেন। প্রথম দিন ব্যাপক বমিসহ মরণাপন্ন'.
- rows [40, 57651], labels ['1', '0']; headline 'রোনালদোকে ছাড়িয়ে হ্যাটট্রিকের রেকর্ড মেসির'; content 'কাম্প নউয়ে মঙ্গলবার চ্যাম্পিয়ন্স লিগের গ্রুপ পর্বে নিজেদের প্রথম ম্যাচে ডাচ চ্যাম্পিয়নদের ৪-০ গোলে হারায় বার্সেলোনা। মেস'.

## Interpretation and limitations

- Identical normalized combined texts with differing labels are verified label conflicts: 1,861 groups.
- Formatting-only cross-label matches: 1,910; manual review is needed to establish whether presentation changes alone explain them.
- Same-content/different-headline cross-label groups: 130.
- Source/publisher effects cannot be analyzed because there is no source column. Split leakage cannot be confirmed or ruled out because no split IDs or training code were found.
- Counts do not match the supplied cleaned dataset counts (48,632 REAL / 9,618 FAKE); a cleaned CSV was not found, so those counts could not be verified.
