"use client";

import { useState, useCallback, useRef, useEffect } from "react";

// ===== TYPES =====
interface Example {
  w: string;
  ipa: string;
  ja: string;
}

interface Phoneme {
  sym: string;
  name: string;
  type: "vowel" | "consonant" | "diphthong";
  ja: string;
  mouth: string;
  soundWord: string;
  soundAlt: string;
  ex: Example[];
}

interface StressItem {
  word: string;
  ipa: string;
  syllables: { t: string; s: boolean }[];
  ja: string;
}

interface ConnectedItem {
  phrase: string;
  ipa: string;
  rule: string;
  ja: string;
}

interface QuizItem {
  sym: string;
  answer: string;
  options: string[];
  speakWord: string;
}

type SectionId =
  | "intro"
  | "vowels"
  | "consonants"
  | "diphthongs"
  | "stress"
  | "connected"
  | "quiz";

// ===== DATA =====
const shortVowels: Phoneme[] = [
  {
    sym: "æ",
    name: "ash / アッシュ",
    type: "vowel",
    ja: "「ア」と「エ」の中間。口を横に大きく開く",
    mouth: "口を左右に大きく引き、顎を下げる。「ア」より口の端を広げる。",
    soundWord: "cat",
    soundAlt: "bad",
    ex: [
      { w: "cat", ipa: "/kæt/", ja: "猫" },
      { w: "hat", ipa: "/hæt/", ja: "帽子" },
      { w: "bad", ipa: "/bæd/", ja: "悪い" },
      { w: "apple", ipa: "/ˈæpəl/", ja: "りんご" },
      { w: "man", ipa: "/mæn/", ja: "男性" },
    ],
  },
  {
    sym: "ɪ",
    name: "small caps I",
    type: "vowel",
    ja: "短い「イ」。日本語より力を抜く",
    mouth: "唇を軽く横に引く。「イー」より緩く、短く。",
    soundWord: "sit",
    soundAlt: "big",
    ex: [
      { w: "sit", ipa: "/sɪt/", ja: "座る" },
      { w: "bit", ipa: "/bɪt/", ja: "少し" },
      { w: "big", ipa: "/bɪɡ/", ja: "大きい" },
      { w: "fish", ipa: "/fɪʃ/", ja: "魚" },
      { w: "it", ipa: "/ɪt/", ja: "それ" },
    ],
  },
  {
    sym: "ʊ",
    name: "upsilon",
    type: "vowel",
    ja: "短い「ウ」。唇を丸めすぎない",
    mouth: "唇を少し丸め前に出す。「ウー」より緩く短く。",
    soundWord: "book",
    soundAlt: "look",
    ex: [
      { w: "book", ipa: "/bʊk/", ja: "本" },
      { w: "look", ipa: "/lʊk/", ja: "見る" },
      { w: "good", ipa: "/ɡʊd/", ja: "良い" },
      { w: "foot", ipa: "/fʊt/", ja: "足" },
      { w: "push", ipa: "/pʊʃ/", ja: "押す" },
    ],
  },
  {
    sym: "e",
    name: "e / エ",
    type: "vowel",
    ja: '日本語の「エ」に近い短音',
    mouth: "口を軽く横に引く。舌は中央から少し前・高め。",
    soundWord: "bed",
    soundAlt: "red",
    ex: [
      { w: "bed", ipa: "/bɛd/", ja: "ベッド" },
      { w: "red", ipa: "/rɛd/", ja: "赤" },
      { w: "ten", ipa: "/tɛn/", ja: "10" },
      { w: "pen", ipa: "/pɛn/", ja: "ペン" },
      { w: "left", ipa: "/lɛft/", ja: "左" },
    ],
  },
  {
    sym: "ʌ",
    name: "wedge / カップ",
    type: "vowel",
    ja: '日本語「ア」より少し狭め・短め',
    mouth: "顎を少し下げる。「ア」より口を小さくして中央で発音。",
    soundWord: "cup",
    soundAlt: "bus",
    ex: [
      { w: "cup", ipa: "/kʌp/", ja: "カップ" },
      { w: "bus", ipa: "/bʌs/", ja: "バス" },
      { w: "fun", ipa: "/fʌn/", ja: "楽しい" },
      { w: "sun", ipa: "/sʌn/", ja: "太陽" },
      { w: "up", ipa: "/ʌp/", ja: "上" },
    ],
  },
  {
    sym: "ɒ",
    name: "open O (英)",
    type: "vowel",
    ja: "短い「オ」。唇を丸めない（英）",
    mouth: "顎を大きく下げ口を開く。唇は丸めない。",
    soundWord: "hot",
    soundAlt: "dog",
    ex: [
      { w: "hot", ipa: "/hɒt/", ja: "熱い" },
      { w: "dog", ipa: "/dɒɡ/", ja: "犬" },
      { w: "stop", ipa: "/stɒp/", ja: "止まる" },
      { w: "lot", ipa: "/lɒt/", ja: "たくさん" },
      { w: "clock", ipa: "/klɒk/", ja: "時計" },
    ],
  },
];

const longVowels: Phoneme[] = [
  {
    sym: "iː",
    name: "long I / イー",
    type: "vowel",
    ja: "「イー」と長く伸ばす",
    mouth: "唇を左右に大きく引き、舌を高く前に。",
    soundWord: "see",
    soundAlt: "free",
    ex: [
      { w: "see", ipa: "/siː/", ja: "見る" },
      { w: "free", ipa: "/friː/", ja: "自由" },
      { w: "be", ipa: "/biː/", ja: "〜である" },
      { w: "key", ipa: "/kiː/", ja: "鍵" },
      { w: "tea", ipa: "/tiː/", ja: "お茶" },
    ],
  },
  {
    sym: "uː",
    name: "long U / ウー",
    type: "vowel",
    ja: "「ウー」と長く伸ばす",
    mouth: "唇を前に突き出し、丸くすぼめる。",
    soundWord: "food",
    soundAlt: "blue",
    ex: [
      { w: "food", ipa: "/fuːd/", ja: "食べ物" },
      { w: "blue", ipa: "/bluː/", ja: "青" },
      { w: "too", ipa: "/tuː/", ja: "〜も" },
      { w: "you", ipa: "/juː/", ja: "あなた" },
      { w: "move", ipa: "/muːv/", ja: "動く" },
    ],
  },
  {
    sym: "ɑː",
    name: "long A (open)",
    type: "vowel",
    ja: "「アー」と長く口を大きく開けて",
    mouth: "口を大きく開ける。舌は後ろ低め。",
    soundWord: "father",
    soundAlt: "car",
    ex: [
      { w: "father", ipa: "/ˈfɑːðər/", ja: "父" },
      { w: "car", ipa: "/kɑː/", ja: "車" },
      { w: "start", ipa: "/stɑːt/", ja: "始める" },
      { w: "heart", ipa: "/hɑːt/", ja: "心" },
      { w: "park", ipa: "/pɑːk/", ja: "公園" },
    ],
  },
  {
    sym: "ɔː",
    name: "long O (British)",
    type: "vowel",
    ja: "「オー」と唇を丸めて長く",
    mouth: "唇を丸め少し前に出す。",
    soundWord: "all",
    soundAlt: "call",
    ex: [
      { w: "all", ipa: "/ɔːl/", ja: "全て" },
      { w: "call", ipa: "/kɔːl/", ja: "呼ぶ" },
      { w: "walk", ipa: "/wɔːk/", ja: "歩く" },
      { w: "law", ipa: "/lɔː/", ja: "法律" },
      { w: "for", ipa: "/fɔː/", ja: "〜のために" },
    ],
  },
  {
    sym: "ɜː",
    name: "long schwa (英)",
    type: "vowel",
    ja: "「ア」と「エ」の中間を長く（英）",
    mouth: "口を軽く開け、力を抜く。舌は中央。",
    soundWord: "bird",
    soundAlt: "word",
    ex: [
      { w: "bird", ipa: "/bɜːd/", ja: "鳥" },
      { w: "word", ipa: "/wɜːd/", ja: "言葉" },
      { w: "first", ipa: "/fɜːst/", ja: "最初" },
      { w: "girl", ipa: "/ɡɜːl/", ja: "少女" },
      { w: "learn", ipa: "/lɜːn/", ja: "学ぶ" },
    ],
  },
];

const specialVowels: Phoneme[] = [
  {
    sym: "ə",
    name: "schwa / シュワー",
    type: "vowel",
    ja: "最頻出！弱く「ア」に近い中性音",
    mouth: "完全脱力。口をわずかに開け、どこにも力を入れない。",
    soundWord: "about",
    soundAlt: "sofa",
    ex: [
      { w: "about", ipa: "/əˈbaʊt/", ja: "〜について" },
      { w: "the", ipa: "/ðə/", ja: "定冠詞" },
      { w: "a", ipa: "/ə/", ja: "不定冠詞" },
      { w: "sofa", ipa: "/ˈsəʊfə/", ja: "ソファ" },
      { w: "problem", ipa: "/ˈprɒbləm/", ja: "問題" },
    ],
  },
];

const plosives: Phoneme[] = [
  {
    sym: "p",
    name: "p / ピー",
    type: "consonant",
    ja: "唇を閉じて空気をためパッと出す（無声）",
    mouth: "上下の唇を軽く合わせ、一瞬止めて勢いよく息を出す。声帯を振動させない。",
    soundWord: "pen",
    soundAlt: "apple",
    ex: [
      { w: "pen", ipa: "/pɛn/", ja: "ペン" },
      { w: "top", ipa: "/tɒp/", ja: "上" },
      { w: "apple", ipa: "/ˈæpəl/", ja: "りんご" },
      { w: "happy", ipa: "/ˈhæpi/", ja: "幸せ" },
    ],
  },
  {
    sym: "b",
    name: "b / ビー",
    type: "consonant",
    ja: "p の有声版。声を出しながらパッ",
    mouth: "p と同じ口の形で、声帯を振動させる。",
    soundWord: "bed",
    soundAlt: "book",
    ex: [
      { w: "bed", ipa: "/bɛd/", ja: "ベッド" },
      { w: "book", ipa: "/bʊk/", ja: "本" },
      { w: "job", ipa: "/dʒɒb/", ja: "仕事" },
      { w: "be", ipa: "/biː/", ja: "〜である" },
    ],
  },
  {
    sym: "t",
    name: "t / ティー",
    type: "consonant",
    ja: "舌先を上歯茎に当ててパッと離す（無声）",
    mouth: "舌先を上の前歯の裏の歯茎につけ、空気をため素早く離す。",
    soundWord: "top",
    soundAlt: "cat",
    ex: [
      { w: "top", ipa: "/tɒp/", ja: "上" },
      { w: "cat", ipa: "/kæt/", ja: "猫" },
      { w: "water", ipa: "/ˈwɔːtər/", ja: "水" },
      { w: "better", ipa: "/ˈbɛtər/", ja: "より良い" },
    ],
  },
  {
    sym: "d",
    name: "d / ディー",
    type: "consonant",
    ja: "t の有声版。声を出しながら",
    mouth: "t と同じ舌の位置で、声帯を振動させる。",
    soundWord: "dog",
    soundAlt: "bad",
    ex: [
      { w: "dog", ipa: "/dɒɡ/", ja: "犬" },
      { w: "bad", ipa: "/bæd/", ja: "悪い" },
      { w: "red", ipa: "/rɛd/", ja: "赤" },
      { w: "hand", ipa: "/hænd/", ja: "手" },
    ],
  },
  {
    sym: "k",
    name: "k / ケー",
    type: "consonant",
    ja: "舌の奥を上あごにつけてパッ（無声）",
    mouth: "舌の後部を口の奥の上あご（軟口蓋）につけ、勢いよく離す。",
    soundWord: "cat",
    soundAlt: "key",
    ex: [
      { w: "cat", ipa: "/kæt/", ja: "猫" },
      { w: "back", ipa: "/bæk/", ja: "後ろ" },
      { w: "key", ipa: "/kiː/", ja: "鍵" },
      { w: "book", ipa: "/bʊk/", ja: "本" },
    ],
  },
  {
    sym: "ɡ",
    name: "g / ジー",
    type: "consonant",
    ja: "k の有声版",
    mouth: "k と同じ舌の位置で、声帯を振動させる。",
    soundWord: "good",
    soundAlt: "go",
    ex: [
      { w: "good", ipa: "/ɡʊd/", ja: "良い" },
      { w: "big", ipa: "/bɪɡ/", ja: "大きい" },
      { w: "dog", ipa: "/dɒɡ/", ja: "犬" },
      { w: "go", ipa: "/ɡəʊ/", ja: "行く" },
    ],
  },
];

const fricatives: Phoneme[] = [
  {
    sym: "f",
    name: "f / エフ",
    type: "consonant",
    ja: "上の歯を下唇に軽く当て息を出す（無声）",
    mouth: "上前歯を下唇に軽く触れさせ、隙間から摩擦音を出す。",
    soundWord: "fish",
    soundAlt: "fun",
    ex: [
      { w: "fish", ipa: "/fɪʃ/", ja: "魚" },
      { w: "fun", ipa: "/fʌn/", ja: "楽しい" },
      { w: "off", ipa: "/ɒf/", ja: "離れて" },
      { w: "life", ipa: "/laɪf/", ja: "生活" },
    ],
  },
  {
    sym: "v",
    name: "v / ヴィー",
    type: "consonant",
    ja: "f の有声版。声を出しながら",
    mouth: "f と同じ口の形で声帯を振動させる。日本語に近い音はない。",
    soundWord: "very",
    soundAlt: "love",
    ex: [
      { w: "very", ipa: "/ˈvɛri/", ja: "とても" },
      { w: "love", ipa: "/lʌv/", ja: "愛" },
      { w: "have", ipa: "/hæv/", ja: "持つ" },
      { w: "five", ipa: "/faɪv/", ja: "5" },
    ],
  },
  {
    sym: "θ",
    name: "theta / θ",
    type: "consonant",
    ja: "舌先を軽く歯の間に入れて息（無声）",
    mouth: "舌先を上下の歯の間に軽く挟み、息を細く出す。",
    soundWord: "think",
    soundAlt: "three",
    ex: [
      { w: "think", ipa: "/θɪŋk/", ja: "考える" },
      { w: "three", ipa: "/θriː/", ja: "3" },
      { w: "thank", ipa: "/θæŋk/", ja: "感謝" },
      { w: "mouth", ipa: "/maʊθ/", ja: "口" },
    ],
  },
  {
    sym: "ð",
    name: "eth / ð",
    type: "consonant",
    ja: "θ の有声版。舌先を歯に当て声を出す",
    mouth: "θ と同じ舌の位置で声帯を振動させる。",
    soundWord: "this",
    soundAlt: "the",
    ex: [
      { w: "the", ipa: "/ðə/", ja: "定冠詞" },
      { w: "this", ipa: "/ðɪs/", ja: "これ" },
      { w: "that", ipa: "/ðæt/", ja: "あれ" },
      { w: "mother", ipa: "/ˈmʌðər/", ja: "母" },
    ],
  },
  {
    sym: "s",
    name: "s / エス",
    type: "consonant",
    ja: '舌先を上歯茎近くにおいて「ス」（無声）',
    mouth: "舌先を上歯茎の近くに置き、細い隙間から息を通す。",
    soundWord: "see",
    soundAlt: "sun",
    ex: [
      { w: "see", ipa: "/siː/", ja: "見る" },
      { w: "sun", ipa: "/sʌn/", ja: "太陽" },
      { w: "bus", ipa: "/bʌs/", ja: "バス" },
      { w: "stop", ipa: "/stɒp/", ja: "止まる" },
    ],
  },
  {
    sym: "z",
    name: "z / ズィー",
    type: "consonant",
    ja: 's の有声版。声を出しながら「ズ」',
    mouth: "s と同じ舌の位置で声帯を振動させる。",
    soundWord: "zoo",
    soundAlt: "is",
    ex: [
      { w: "zoo", ipa: "/zuː/", ja: "動物園" },
      { w: "has", ipa: "/hæz/", ja: "持っている" },
      { w: "is", ipa: "/ɪz/", ja: "〜である" },
      { w: "zero", ipa: "/ˈzɪərəʊ/", ja: "ゼロ" },
    ],
  },
  {
    sym: "ʃ",
    name: "esh / シュ",
    type: "consonant",
    ja: "「シュ」（無声）",
    mouth: "唇をわずかに丸め前に出す。舌は s より後ろ。",
    soundWord: "she",
    soundAlt: "shop",
    ex: [
      { w: "she", ipa: "/ʃiː/", ja: "彼女" },
      { w: "fish", ipa: "/fɪʃ/", ja: "魚" },
      { w: "shop", ipa: "/ʃɒp/", ja: "店" },
      { w: "wish", ipa: "/wɪʃ/", ja: "望む" },
    ],
  },
  {
    sym: "ʒ",
    name: "ezh / ジュ",
    type: "consonant",
    ja: "ʃ の有声版。「ジュ」",
    mouth: "ʃ と同じ口の形で声帯を振動させる。",
    soundWord: "pleasure",
    soundAlt: "measure",
    ex: [
      { w: "pleasure", ipa: "/ˈplɛʒər/", ja: "喜び" },
      { w: "measure", ipa: "/ˈmɛʒər/", ja: "測る" },
      { w: "vision", ipa: "/ˈvɪʒən/", ja: "ビジョン" },
    ],
  },
  {
    sym: "h",
    name: "h / エイチ",
    type: "consonant",
    ja: "「ハ行」の息の音（無声）",
    mouth: "口を開け、喉から息を出すだけ。",
    soundWord: "hat",
    soundAlt: "hello",
    ex: [
      { w: "hat", ipa: "/hæt/", ja: "帽子" },
      { w: "hot", ipa: "/hɒt/", ja: "熱い" },
      { w: "hello", ipa: "/həˈləʊ/", ja: "こんにちは" },
      { w: "have", ipa: "/hæv/", ja: "持つ" },
    ],
  },
  {
    sym: "tʃ",
    name: "ch / チュ",
    type: "consonant",
    ja: "「チ」または「チュ」（無声）",
    mouth: "t の舌の形から ʃ の摩擦音に移行。",
    soundWord: "chair",
    soundAlt: "check",
    ex: [
      { w: "chair", ipa: "/tʃɛr/", ja: "椅子" },
      { w: "church", ipa: "/tʃɜːtʃ/", ja: "教会" },
      { w: "check", ipa: "/tʃɛk/", ja: "確認" },
      { w: "watch", ipa: "/wɒtʃ/", ja: "見る" },
    ],
  },
  {
    sym: "dʒ",
    name: "dʒ / ジュ",
    type: "consonant",
    ja: 'tʃ の有声版。「ジ」「ヂュ」',
    mouth: "tʃ と同じ口の形で声帯を振動させる。",
    soundWord: "job",
    soundAlt: "just",
    ex: [
      { w: "job", ipa: "/dʒɒb/", ja: "仕事" },
      { w: "just", ipa: "/dʒʌst/", ja: "ちょうど" },
      { w: "age", ipa: "/eɪdʒ/", ja: "年齢" },
      { w: "bridge", ipa: "/brɪdʒ/", ja: "橋" },
    ],
  },
];

const nasals: Phoneme[] = [
  {
    sym: "m",
    name: "m / エム",
    type: "consonant",
    ja: "唇を閉じて鼻から声を出す",
    mouth: "唇を合わせ、声を鼻から通す。",
    soundWord: "man",
    soundAlt: "some",
    ex: [
      { w: "man", ipa: "/mæn/", ja: "男性" },
      { w: "me", ipa: "/miː/", ja: "私" },
      { w: "some", ipa: "/sʌm/", ja: "いくつか" },
    ],
  },
  {
    sym: "n",
    name: "n / エン",
    type: "consonant",
    ja: "舌先を上歯茎にあて鼻から声を出す",
    mouth: "舌先を上歯茎に当て、声を鼻から通す。",
    soundWord: "no",
    soundAlt: "ten",
    ex: [
      { w: "no", ipa: "/nəʊ/", ja: "いいえ" },
      { w: "ten", ipa: "/tɛn/", ja: "10" },
      { w: "sun", ipa: "/sʌn/", ja: "太陽" },
    ],
  },
  {
    sym: "ŋ",
    name: "eng / ング",
    type: "consonant",
    ja: "「ング」の鼻音",
    mouth: "舌の奥を軟口蓋につけたまま鼻から音を出す。",
    soundWord: "sing",
    soundAlt: "king",
    ex: [
      { w: "sing", ipa: "/sɪŋ/", ja: "歌う" },
      { w: "king", ipa: "/kɪŋ/", ja: "王" },
      { w: "long", ipa: "/lɒŋ/", ja: "長い" },
      { w: "thinking", ipa: "/ˈθɪŋkɪŋ/", ja: "考えること" },
    ],
  },
  {
    sym: "l",
    name: "l / エル",
    type: "consonant",
    ja: "舌先を上歯茎に当て声を流す",
    mouth: "舌先を上歯茎につけ、舌の両側から声を流す。",
    soundWord: "love",
    soundAlt: "left",
    ex: [
      { w: "love", ipa: "/lʌv/", ja: "愛" },
      { w: "left", ipa: "/lɛft/", ja: "左" },
      { w: "call", ipa: "/kɔːl/", ja: "呼ぶ" },
    ],
  },
  {
    sym: "r",
    name: "r / アール",
    type: "consonant",
    ja: "舌先を反り上げ、どこにも触れない",
    mouth: "舌先を少し後ろに引き反らせ、どこにも触れないように声を出す。",
    soundWord: "red",
    soundAlt: "right",
    ex: [
      { w: "red", ipa: "/rɛd/", ja: "赤" },
      { w: "right", ipa: "/raɪt/", ja: "右" },
      { w: "problem", ipa: "/ˈprɒbləm/", ja: "問題" },
    ],
  },
  {
    sym: "w",
    name: "w / ダブリュー",
    type: "consonant",
    ja: "「ウ」から始まる半母音",
    mouth: "唇を丸くすぼめ前に突き出す。次の音へ素早く移る。",
    soundWord: "we",
    soundAlt: "water",
    ex: [
      { w: "we", ipa: "/wiː/", ja: "私たち" },
      { w: "water", ipa: "/ˈwɔːtər/", ja: "水" },
      { w: "word", ipa: "/wɜːd/", ja: "言葉" },
    ],
  },
  {
    sym: "j",
    name: "j / ヤ",
    type: "consonant",
    ja: "「ヤ」行の半母音",
    mouth: "舌を /iː/ の位置に置き、次の音へ素早く移る。",
    soundWord: "yes",
    soundAlt: "you",
    ex: [
      { w: "yes", ipa: "/jɛs/", ja: "はい" },
      { w: "you", ipa: "/juː/", ja: "あなた" },
      { w: "year", ipa: "/jɪr/", ja: "年" },
    ],
  },
];

const diphthongData: Phoneme[] = [
  {
    sym: "eɪ",
    name: "face / エイ",
    type: "diphthong",
    ja: "「エ→イ」と滑らかにつなぐ",
    mouth: "「エ」から始めて「イ」に向かって滑らかに移動。",
    soundWord: "face",
    soundAlt: "day",
    ex: [
      { w: "face", ipa: "/feɪs/", ja: "顔" },
      { w: "day", ipa: "/deɪ/", ja: "日" },
      { w: "make", ipa: "/meɪk/", ja: "作る" },
      { w: "say", ipa: "/seɪ/", ja: "言う" },
      { w: "name", ipa: "/neɪm/", ja: "名前" },
    ],
  },
  {
    sym: "aɪ",
    name: "price / アイ",
    type: "diphthong",
    ja: "「ア→イ」",
    mouth: "「ア」から「イ」へ。口を大きく開けてから狭める。",
    soundWord: "my",
    soundAlt: "time",
    ex: [
      { w: "my", ipa: "/maɪ/", ja: "私の" },
      { w: "time", ipa: "/taɪm/", ja: "時間" },
      { w: "five", ipa: "/faɪv/", ja: "5" },
      { w: "high", ipa: "/haɪ/", ja: "高い" },
      { w: "I", ipa: "/aɪ/", ja: "私" },
    ],
  },
  {
    sym: "ɔɪ",
    name: "choice / オイ",
    type: "diphthong",
    ja: "「オ→イ」",
    mouth: "「オ」から「イ」へ。唇を丸めた状態から横に引く。",
    soundWord: "boy",
    soundAlt: "enjoy",
    ex: [
      { w: "boy", ipa: "/bɔɪ/", ja: "少年" },
      { w: "enjoy", ipa: "/ɪnˈdʒɔɪ/", ja: "楽しむ" },
      { w: "oil", ipa: "/ɔɪl/", ja: "オイル" },
      { w: "coin", ipa: "/kɔɪn/", ja: "コイン" },
    ],
  },
  {
    sym: "əʊ",
    name: "goat / オウ（英）",
    type: "diphthong",
    ja: "「(ア)→ウ」（英）",
    mouth: '弱い「ア」から「ウ」へ。',
    soundWord: "go",
    soundAlt: "no",
    ex: [
      { w: "go", ipa: "/ɡəʊ/", ja: "行く" },
      { w: "no", ipa: "/nəʊ/", ja: "いいえ" },
      { w: "home", ipa: "/həʊm/", ja: "家" },
      { w: "so", ipa: "/səʊ/", ja: "だから" },
      { w: "know", ipa: "/nəʊ/", ja: "知っている" },
    ],
  },
  {
    sym: "aʊ",
    name: "mouth / アウ",
    type: "diphthong",
    ja: "「ア→ウ」",
    mouth: '「ア」から唇を丸めた「ウ」へ。',
    soundWord: "now",
    soundAlt: "how",
    ex: [
      { w: "now", ipa: "/naʊ/", ja: "今" },
      { w: "how", ipa: "/haʊ/", ja: "どのように" },
      { w: "out", ipa: "/aʊt/", ja: "外" },
      { w: "house", ipa: "/haʊs/", ja: "家" },
      { w: "town", ipa: "/taʊn/", ja: "町" },
    ],
  },
  {
    sym: "ɪə",
    name: "near / イア（英）",
    type: "diphthong",
    ja: "「イ→ア」（英）",
    mouth: '「イ」から弱い「ア」へ。',
    soundWord: "here",
    soundAlt: "ear",
    ex: [
      { w: "here", ipa: "/hɪə/", ja: "ここ" },
      { w: "ear", ipa: "/ɪə/", ja: "耳" },
      { w: "near", ipa: "/nɪə/", ja: "近い" },
      { w: "idea", ipa: "/aɪˈdɪə/", ja: "アイデア" },
    ],
  },
  {
    sym: "eə",
    name: "square / エア（英）",
    type: "diphthong",
    ja: "「エ→ア」",
    mouth: '「エ」から弱い「ア」へ。',
    soundWord: "air",
    soundAlt: "where",
    ex: [
      { w: "air", ipa: "/eə/", ja: "空気" },
      { w: "where", ipa: "/weə/", ja: "どこ" },
      { w: "there", ipa: "/ðeə/", ja: "そこ" },
      { w: "care", ipa: "/keə/", ja: "気にかける" },
    ],
  },
  {
    sym: "ʊə",
    name: "cure / ウア（英）",
    type: "diphthong",
    ja: "「ウ→ア」",
    mouth: '「ウ」から弱い「ア」へ。',
    soundWord: "cure",
    soundAlt: "sure",
    ex: [
      { w: "cure", ipa: "/kjʊə/", ja: "治す" },
      { w: "sure", ipa: "/ʃʊə/", ja: "確かに" },
      { w: "tour", ipa: "/tʊə/", ja: "旅行" },
    ],
  },
];

const stressData: StressItem[] = [
  {
    word: "water",
    ipa: "/ˈwɔː.tər/",
    syllables: [
      { t: "WA", s: true },
      { t: "ter", s: false },
    ],
    ja: "「ウォーター」と違い最初が強い",
  },
  {
    word: "banana",
    ipa: "/bəˈnɑː.nə/",
    syllables: [
      { t: "ba", s: false },
      { t: "NA", s: true },
      { t: "na", s: false },
    ],
    ja: '真ん中！「ブナーナ」',
  },
  {
    word: "camera",
    ipa: "/ˈkæm.ər.ə/",
    syllables: [
      { t: "CAM", s: true },
      { t: "er", s: false },
      { t: "a", s: false },
    ],
    ja: "最初が強い。3音節",
  },
  {
    word: "beautiful",
    ipa: "/ˈbjuː.tɪ.fəl/",
    syllables: [
      { t: "BEA", s: true },
      { t: "ti", s: false },
      { t: "ful", s: false },
    ],
    ja: "「ビュー」が強い",
  },
  {
    word: "chocolate",
    ipa: "/ˈtʃɒk.lət/",
    syllables: [
      { t: "CHOC", s: true },
      { t: "late", s: false },
    ],
    ja: "英語では2音節！",
  },
  {
    word: "interesting",
    ipa: "/ˈɪn.trəs.tɪŋ/",
    syllables: [
      { t: "IN", s: true },
      { t: "tres", s: false },
      { t: "ting", s: false },
    ],
    ja: "最初が強い",
  },
  {
    word: "understand",
    ipa: "/ˌʌn.dəˈstænd/",
    syllables: [
      { t: "un", s: false },
      { t: "der", s: false },
      { t: "STAND", s: true },
    ],
    ja: "最後が一番強い！",
  },
];

const connectedData: Record<string, ConnectedItem[]> = {
  linking: [
    {
      phrase: "an apple",
      ipa: "/ə ˈnæpəl/",
      rule: "リンキング",
      ja: "「an」の/n/と「apple」がつながって「ナップル」のように聞こえる",
    },
    {
      phrase: "pick it up",
      ipa: "/ˈpɪ kɪt ˈʌp/",
      rule: "リンキング",
      ja: "子音+母音が連続してつながる",
    },
    {
      phrase: "turn off",
      ipa: "/ˈtɜːn ˈɒf/",
      rule: "リンキング",
      ja: "「ターノフ」のようにつながる",
    },
  ],
  flapping: [
    {
      phrase: "water",
      ipa: "/ˈwɔːɾər/",
      rule: "フラッピング（米）",
      ja: "「ウォーダー」に近い。/t/ が /ɾ/ に変化",
    },
    {
      phrase: "better",
      ipa: "/ˈbɛɾər/",
      rule: "フラッピング（米）",
      ja: "「ベダー」に近い",
    },
    {
      phrase: "city",
      ipa: "/ˈsɪɾi/",
      rule: "フラッピング（米）",
      ja: "「スィリ」のように聞こえる",
    },
  ],
  elision: [
    {
      phrase: "next day",
      ipa: "/ˈnɛks deɪ/",
      rule: "脱落",
      ja: '/t/ が消えて「ネクス デイ」',
    },
    {
      phrase: "last night",
      ipa: "/ˈlæs naɪt/",
      rule: "脱落",
      ja: '/t/ が消えて「ラス ナイト」',
    },
    {
      phrase: "I want to go",
      ipa: "/aɪ ˈwɒnə ˈɡəʊ/",
      rule: "脱落・短縮",
      ja: '"want to" → "wanna"',
    },
  ],
  assimilation: [
    {
      phrase: "ten boys",
      ipa: "/ˈtɛm bɔɪz/",
      rule: "同化",
      ja: "/n/ が /b/ の前で /m/ に変化",
    },
    {
      phrase: "in Paris",
      ipa: "/ɪm ˈpærɪs/",
      rule: "同化",
      ja: "/n/ が /p/ の前で /m/ に",
    },
    {
      phrase: "good morning",
      ipa: "/ˌɡʊb ˈmɔːnɪŋ/",
      rule: "同化",
      ja: "/d/ が /m/ の前で /b/ に変化",
    },
  ],
};

const quizData: QuizItem[] = [
  {
    sym: "/æ/",
    answer: "「ア」と「エ」の中間（cat）",
    options: [
      "「イー」と長く（see）",
      "「ア」と「エ」の中間（cat）",
      "「ウー」と長く（food）",
      "弱い中性音（about）",
    ],
    speakWord: "cat",
  },
  {
    sym: "/iː/",
    answer: "「イー」と長く（see）",
    options: [
      "「ア」と「エ」の中間（cat）",
      "「イー」と長く（see）",
      "「ウ」短く（book）",
      "「オ」長く（all）",
    ],
    speakWord: "see",
  },
  {
    sym: "/θ/",
    answer: "舌先を歯に挟んで息（think）",
    options: [
      "舌先を歯に挟んで息（think）",
      "「ス」（see）",
      "「ス」有声版（zoo）",
      "唇で作る摩擦音（fish）",
    ],
    speakWord: "think",
  },
  {
    sym: "/ə/",
    answer: "弱い中性音（about）",
    options: [
      "「ア」長い（father）",
      "「エ」（bed）",
      "弱い中性音（about）",
      "「ア」短く（cup）",
    ],
    speakWord: "about",
  },
  {
    sym: "/ŋ/",
    answer: "「ング」の鼻音（sing）",
    options: [
      "「ン」前に歯茎（sun）",
      "「ン」唇で（some）",
      "「ング」の鼻音（sing）",
      "「ニャ」（yes）",
    ],
    speakWord: "sing",
  },
  {
    sym: "/aɪ/",
    answer: "「ア→イ」（my）",
    options: [
      "「エ→イ」（day）",
      "「ア→イ」（my）",
      "「オ→イ」（boy）",
      "「ア→ウ」（now）",
    ],
    speakWord: "my",
  },
  {
    sym: "/ʃ/",
    answer: "「シュ」無声（she）",
    options: [
      "「ス」（see）",
      "「ジュ」有声（pleasure）",
      "「チュ」（chair）",
      "「シュ」無声（she）",
    ],
    speakWord: "she",
  },
  {
    sym: "/ɜː/",
    answer: "「アー」r前の長音（bird）",
    options: [
      "「アー」r前の長音（bird）",
      "「オー」（all）",
      "「アー」大きく開ける（car）",
      "弱い中性音（about）",
    ],
    speakWord: "bird",
  },
];

// ===== SPEECH =====
function speak(text: string, rate = 0.9) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = rate;
  window.speechSynthesis.speak(u);
}

function speakSlow(text: string) {
  speak(text, 0.45);
}

// ===== COMPONENTS =====

function PhonemeCard({
  phoneme,
  onClick,
}: {
  phoneme: Phoneme;
  onClick: () => void;
}) {
  return (
    <div className={`phoneme-card ${phoneme.type}`} onClick={onClick}>
      <div className="phoneme-symbol">{phoneme.sym}</div>
      <div className="phoneme-name">{phoneme.name}</div>
      <div className="phoneme-example">{phoneme.ex[0].w}</div>
      <div className="phoneme-ja">{phoneme.ja.slice(0, 18)}…</div>
    </div>
  );
}

function DetailPanel({
  phoneme,
  onClose,
}: {
  phoneme: Phoneme | null;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phoneme && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [phoneme]);

  if (!phoneme) return null;

  const colorMap = {
    vowel: "var(--red)",
    consonant: "var(--blue)",
    diphthong: "var(--green)",
  };
  const color = colorMap[phoneme.type];

  return (
    <div ref={panelRef} className="detail-panel show">
      <button className="close-detail" onClick={onClose}>
        ✕
      </button>
      <div className="detail-header">
        <div className="detail-symbol" style={{ color, borderColor: color }}>
          {phoneme.sym}
        </div>
        <div className="detail-meta">
          <h2>{phoneme.name}</h2>
          <p>{phoneme.ja}</p>
        </div>
      </div>

      <div className="sound-panel">
        <div className="sound-panel-sym">{phoneme.sym}</div>
        <div className="sound-panel-info">
          <div className="sp-title">📣 この発音記号の音を聞く</div>
          <div className="sound-panel-btns">
            <div>
              <button
                className="sp-btn normal"
                onClick={() => speak(phoneme.soundWord)}
              >
                🔊 普通の速さ
              </button>
              <span className="sp-label">{phoneme.soundWord}</span>
            </div>
            <div>
              <button
                className="sp-btn slow-v"
                onClick={() => speakSlow(phoneme.soundWord)}
              >
                🐢 ゆっくり
              </button>
              <span className="sp-label">0.5倍速</span>
            </div>
            <div>
              <button
                className="sp-btn word-v"
                onClick={() => speak(phoneme.soundAlt)}
              >
                📝 別の例語
              </button>
              <span className="sp-label">{phoneme.soundAlt}</span>
            </div>
            <div>
              <button
                className="sp-btn word-v"
                onClick={() => speakSlow(phoneme.soundAlt)}
              >
                🐢 別の例（遅）
              </button>
              <span className="sp-label">0.5倍速</span>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <h3>口の形・発音のコツ</h3>
        <div className="articulation-box">{phoneme.mouth}</div>
      </div>
      <div className="detail-section">
        <h3>例語一覧（▶ 普通 / 🐢 ゆっくり）</h3>
        <div className="example-list">
          {phoneme.ex.map((e) => (
            <div key={e.w} className="example-item">
              <span className="example-word">{e.w}</span>
              <span className="example-ipa">{e.ipa}</span>
              <span className="example-ja">{e.ja}</span>
              <button
                className="play-word-btn"
                title="普通の速さ"
                onClick={() => speak(e.w)}
              >
                ▶
              </button>
              <button
                className="play-word-btn slow-word"
                title="ゆっくり"
                onClick={() => speakSlow(e.w)}
              >
                🐢
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StressSection() {
  return (
    <div>
      {stressData.map((s) => (
        <div key={s.word} className="stress-demo">
          <div className="stress-word">{s.word}</div>
          <div className="stress-ipa">{s.ipa}</div>
          <div>
            {s.syllables.map((sy, i) => (
              <span key={i} className={`syllable ${sy.s ? "strong" : "weak"}`}>
                {sy.t}
              </span>
            ))}
          </div>
          <div className="stress-ja">{s.ja}</div>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 10,
              flexWrap: "wrap",
            }}
          >
            <button
              className="sp-btn normal"
              style={{ padding: "6px 12px", fontSize: "0.75rem" }}
              onClick={() => speak(s.word)}
            >
              🔊 普通
            </button>
            <button
              className="sp-btn slow-v"
              style={{ padding: "6px 12px", fontSize: "0.75rem" }}
              onClick={() => speakSlow(s.word)}
            >
              🐢 ゆっくり
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ConnectedList({ items }: { items: ConnectedItem[] }) {
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} className="connected-example">
          <div className="connected-phrase">{item.phrase}</div>
          <div className="connected-ipa">{item.ipa}</div>
          <span className="connected-rule">{item.rule}</span>
          <div className="connected-ja">{item.ja}</div>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 10,
              flexWrap: "wrap",
            }}
          >
            <button
              className="sp-btn normal"
              style={{ padding: "6px 12px", fontSize: "0.75rem" }}
              onClick={() => speak(item.phrase)}
            >
              🔊 普通
            </button>
            <button
              className="sp-btn slow-v"
              style={{ padding: "6px 12px", fontSize: "0.75rem" }}
              onClick={() => speakSlow(item.phrase)}
            >
              🐢 ゆっくり
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function QuizSection() {
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(() =>
    Math.floor(Math.random() * quizData.length)
  );
  const [answered, setAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>(() =>
    [...quizData[Math.floor(Math.random() * quizData.length)].options].sort(
      () => Math.random() - 0.5
    )
  );

  const q = quizData[currentIdx];

  useEffect(() => {
    setShuffledOptions(
      [...quizData[currentIdx].options].sort(() => Math.random() - 0.5)
    );
  }, [currentIdx]);

  const handleAnswer = (opt: string) => {
    if (answered) return;
    setAnswered(true);
    setSelectedOption(opt);
    setTotal((t) => t + 1);
    if (opt === q.answer) {
      setScore((s) => s + 1);
    }
    speak(q.speakWord);
  };

  const nextQuiz = () => {
    setAnswered(false);
    setSelectedOption(null);
    setCurrentIdx(Math.floor(Math.random() * quizData.length));
  };

  const getOptionClass = (opt: string) => {
    if (!answered) return "quiz-option";
    if (opt === q.answer) return "quiz-option correct";
    if (opt === selectedOption && opt !== q.answer) return "quiz-option wrong";
    return "quiz-option";
  };

  return (
    <div className="quiz-card">
      <div className="quiz-score">
        スコア: {score} / {total}
      </div>
      <p style={{ fontSize: "0.82rem", opacity: 0.6, marginBottom: 8 }}>
        この発音記号の音はどれ？
      </p>
      <div className="quiz-question">{q.sym}</div>
      <p className="quiz-hint">
        「{q.speakWord}」を含む単語の音
      </p>
      <div className="quiz-sound-row">
        <button className="sp-btn normal" onClick={() => speak(q.speakWord)}>
          🔊 普通の速さ
        </button>
        <button
          className="sp-btn slow-v"
          onClick={() => speakSlow(q.speakWord)}
        >
          🐢 ゆっくり
        </button>
      </div>
      <div className="quiz-options">
        {shuffledOptions.map((opt) => (
          <button
            key={opt}
            className={getOptionClass(opt)}
            onClick={() => handleAnswer(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="quiz-result">
        {answered &&
          (selectedOption === q.answer ? (
            <span style={{ color: "#155724" }}>✅ 正解！</span>
          ) : (
            <span style={{ color: "#721c24" }}>❌ 正解は「{q.answer}」</span>
          ))}
      </div>
      {answered && (
        <button className="btn-primary" onClick={nextQuiz}>
          次の問題 →
        </button>
      )}
    </div>
  );
}

// ===== MAIN =====
const sections: { id: SectionId; label: string }[] = [
  { id: "intro", label: "🏠 はじめに" },
  { id: "vowels", label: "🔴 母音" },
  { id: "consonants", label: "🔵 子音" },
  { id: "diphthongs", label: "🟢 二重母音" },
  { id: "stress", label: "📐 強弱・音節" },
  { id: "connected", label: "🔗 つながり音" },
  { id: "quiz", label: "🎯 確認テスト" },
];

export default function PhoneticsApp() {
  const [activeSection, setActiveSection] = useState<SectionId>("intro");
  const [selectedVowel, setSelectedVowel] = useState<Phoneme | null>(null);
  const [selectedConsonant, setSelectedConsonant] = useState<Phoneme | null>(
    null
  );
  const [selectedDiphthong, setSelectedDiphthong] = useState<Phoneme | null>(
    null
  );

  const showSection = useCallback((id: SectionId) => {
    setActiveSection(id);
  }, []);

  const renderPhonemeGrid = (
    phonemes: Phoneme[],
    selected: Phoneme | null,
    setSelected: (p: Phoneme | null) => void
  ) => (
    <div className="phoneme-grid">
      {phonemes.map((p) => (
        <PhonemeCard
          key={p.sym}
          phoneme={p}
          onClick={() => setSelected(p === selected ? null : p)}
        />
      ))}
    </div>
  );

  return (
    <>
      <header className="app-header">
        <h1>🔤 英語発音記号 完全ガイド</h1>
        <p>International Phonetic Alphabet — 初心者から上級者まで</p>
      </header>

      <nav>
        {sections.map((s) => (
          <button
            key={s.id}
            className={`nav-btn ${activeSection === s.id ? "active" : ""}`}
            onClick={() => showSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <main>
        {/* INTRO */}
        <div
          className={`section ${activeSection === "intro" ? "active" : ""}`}
        >
          <div className="intro-hero">
            <div className="ipa-deco">/ ˌfəʊˈnɛtɪks /</div>
            <h2>発音記号って何？なぜ必要？</h2>
            <p>
              英語は「書いてある通りに読めない」言語です。
              <br />
              発音記号を覚えると、辞書を引けばどんな単語も正確に発音できます。
            </p>
          </div>
          <div className="tip-box">
            💡 <strong>例えば：</strong>
            「read」は過去形だと「レッド /rɛd/」、現在形だと「リード /riːd/」と全然違う！
            <br />
            「the」も「ザ /ðə/」か「ジ /ði/」か、後ろに来る音で変わります。
            <br />
            発音記号さえ読めれば、こういった混乱が全部解決します。
          </div>
          <div className="grid-2">
            <div className="info-card">
              <h3>📚 IPAとは</h3>
              <p>
                International Phonetic
                Alphabet（国際音声記号）の略。世界中の辞書で使われている共通ルールです。
              </p>
            </div>
            <div className="info-card">
              <h3>🎯 学ぶ順番</h3>
              <p>
                ① 短母音 → ② 長母音 → ③ 子音 → ④ 二重母音 → ⑤ 強弱・音節 →
                ⑥ つながり音
              </p>
            </div>
            <div className="info-card">
              <h3>🔴🔵🟢 色の意味</h3>
              <p>
                <span style={{ color: "var(--red)" }}>赤＝母音</span>　
                <span style={{ color: "var(--blue)" }}>青＝子音</span>　
                <span style={{ color: "var(--green)" }}>緑＝二重母音</span>
              </p>
            </div>
            <div className="info-card">
              <h3>🔊 音声ボタンの種類</h3>
              <p>
                🔊 <strong>普通</strong>：通常の速さ
                <br />
                🐢 <strong>ゆっくり</strong>：0.5倍速でじっくり確認
                <br />
                📝 <strong>例語</strong>：単語の中での音を確認
              </p>
            </div>
          </div>
          <div
            className="tip-box"
            style={{ borderColor: "var(--blue)", background: "#f0f4ff" }}
          >
            📖 <strong>記号の読み方ルール：</strong>
            <br />
            <code
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
              }}
            >
              /…/
            </code>
            　スラッシュに挟まれた部分が発音記号
            <br />
            <code
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
              }}
            >
              ː
            </code>
            　長く伸ばす（例：/iː/ = 「イー」）
            <br />
            <code
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
              }}
            >
              ˈ
            </code>
            　直後の音節を強く読む
            <br />
            <code
              style={{
                fontFamily: "var(--font-jetbrains), monospace",
              }}
            >
              ˌ
            </code>
            　第2アクセント（やや強め）
          </div>
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button
              className="btn-primary"
              onClick={() => showSection("vowels")}
            >
              母音から始める →
            </button>
          </div>
        </div>

        {/* VOWELS */}
        <div
          className={`section ${activeSection === "vowels" ? "active" : ""}`}
        >
          <DetailPanel
            phoneme={selectedVowel}
            onClose={() => setSelectedVowel(null)}
          />
          <h2 className="category-title">🔴 短母音（Short Vowels）</h2>
          {renderPhonemeGrid(shortVowels, selectedVowel, setSelectedVowel)}
          <h2 className="category-title">🔴 長母音（Long Vowels）</h2>
          {renderPhonemeGrid(longVowels, selectedVowel, setSelectedVowel)}
          <h2 className="category-title">🔴 特殊母音（Schwa & others）</h2>
          {renderPhonemeGrid(specialVowels, selectedVowel, setSelectedVowel)}
        </div>

        {/* CONSONANTS */}
        <div
          className={`section ${activeSection === "consonants" ? "active" : ""}`}
        >
          <DetailPanel
            phoneme={selectedConsonant}
            onClose={() => setSelectedConsonant(null)}
          />
          <h2 className="category-title">🔵 破裂音（Plosives）</h2>
          {renderPhonemeGrid(
            plosives,
            selectedConsonant,
            setSelectedConsonant
          )}
          <h2 className="category-title">🔵 摩擦音（Fricatives）</h2>
          {renderPhonemeGrid(
            fricatives,
            selectedConsonant,
            setSelectedConsonant
          )}
          <h2 className="category-title">🔵 鼻音・側音・半母音</h2>
          {renderPhonemeGrid(nasals, selectedConsonant, setSelectedConsonant)}
        </div>

        {/* DIPHTHONGS */}
        <div
          className={`section ${activeSection === "diphthongs" ? "active" : ""}`}
        >
          <DetailPanel
            phoneme={selectedDiphthong}
            onClose={() => setSelectedDiphthong(null)}
          />
          <div className="tip-box">
            🟢 <strong>二重母音とは？</strong>{" "}
            2つの母音音が滑らかにつながる音。始まりからゴールの音へ「滑り込む」イメージ。
          </div>
          {renderPhonemeGrid(
            diphthongData,
            selectedDiphthong,
            setSelectedDiphthong
          )}
        </div>

        {/* STRESS */}
        <div
          className={`section ${activeSection === "stress" ? "active" : ""}`}
        >
          <div className="tip-box">
            📐 <strong>強弱（ストレス）と音節</strong> —
            強く読む音節を間違えると通じない英語に！
            <span
              style={{
                background: "var(--gold)",
                color: "white",
                padding: "0 4px",
                borderRadius: 3,
              }}
            >
              金色
            </span>
            が強い音節。
          </div>
          <h2 className="category-title">よく間違える単語の強弱</h2>
          <StressSection />
          <div
            className="tip-box"
            style={{ marginTop: 20, borderColor: "var(--red)" }}
          >
            ⚠️ <strong>品詞でアクセントが変わる単語</strong>
            <br />• <strong>REcord</strong>（名詞）vs.{" "}
            <strong>reCORD</strong>（動詞）
            <br />• <strong>PREsent</strong>（名詞）vs.{" "}
            <strong>preSENT</strong>（動詞）
          </div>
        </div>

        {/* CONNECTED */}
        <div
          className={`section ${activeSection === "connected" ? "active" : ""}`}
        >
          <div className="tip-box">
            🔗 <strong>つながり音</strong> —
            ネイティブが話すとき単語と単語がつながって変化します。
          </div>
          <h2 className="category-title">① リンキング（Linking）</h2>
          <ConnectedList items={connectedData.linking} />
          <h2 className="category-title">② フラッピング（米語）</h2>
          <ConnectedList items={connectedData.flapping} />
          <h2 className="category-title">③ 脱落（Elision）</h2>
          <ConnectedList items={connectedData.elision} />
          <h2 className="category-title">④ 同化（Assimilation）</h2>
          <ConnectedList items={connectedData.assimilation} />
        </div>

        {/* QUIZ */}
        <div
          className={`section ${activeSection === "quiz" ? "active" : ""}`}
        >
          <QuizSection />
        </div>
      </main>
    </>
  );
}
