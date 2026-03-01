/**
 * Content Moderation System
 * Filters inappropriate content before publishing to social media.
 * Works in 3 layers:
 *   1. Regex-based profanity/hate speech detection (instant, free)
 *   2. Pattern-based spam/scam detection
 *   3. Optional AI moderation via OpenAI Moderation API (when available)
 */

// ============ TYPES ============

export interface ModerationResult {
  approved: boolean;
  score: number; // 0-1, higher = more problematic
  flags: ModerationFlag[];
  suggestions: string[];
}

export interface ModerationFlag {
  type: ModerationCategory;
  severity: 'low' | 'medium' | 'high';
  match: string;
  reason: string;
}

export type ModerationCategory =
  | 'profanity'
  | 'hate_speech'
  | 'sexual'
  | 'violence'
  | 'spam'
  | 'scam'
  | 'self_harm'
  | 'illegal'
  | 'personal_info'
  | 'misleading';

// ============ WORD LISTS (Portuguese + English) ============

const PROFANITY_PATTERNS: { pattern: RegExp; severity: 'low' | 'medium' | 'high' }[] = [
  // Portuguese strong profanity
  { pattern: /\b(porra|caralho|foda-se|fodase|puta|merda|cacete|desgraç|arrombad|filh[oa]\s*da\s*puta|fdp|vsf|tnc|pqp|krl)\b/gi, severity: 'high' },
  // English strong profanity
  { pattern: /\b(fuck|shit|bitch|asshole|bastard|damn|crap|dick|pussy|cock|cunt|motherfuck|wtf|stfu)\b/gi, severity: 'high' },
  // Mild profanity
  { pattern: /\b(droga|inferno|raios|caramba|maldito|idiota|imbecil|otário|babaca|trouxa|burr[oa])\b/gi, severity: 'low' },
];

const HATE_SPEECH_PATTERNS: { pattern: RegExp; severity: 'medium' | 'high' }[] = [
  { pattern: /\b(nazist|fascist|supremacist|white\s*power|heil|aryan)\b/gi, severity: 'high' },
  { pattern: /\b(negro\s*lixo|pret[oa]\s*immund|macac[oa]|viado\s*nojent|sapat[ãa]o\s*nojent|travec[oa]\s*nojent)\b/gi, severity: 'high' },
  { pattern: /\b(morte\s*a[os]?\s*\w+|eliminar\s*(raça|gente|povo)|exterminar|genocíd)\b/gi, severity: 'high' },
];

const SEXUAL_PATTERNS: { pattern: RegExp; severity: 'medium' | 'high' }[] = [
  { pattern: /\b(porn[ôo]|sexo\s*explicit|nude[sz]|nudes|onlyfans|conteúdo\s*adult|strip\s*tease|xxx|hentai)\b/gi, severity: 'high' },
  { pattern: /\b(gostosa|delícia|rabuda|peituda|gostoso|sarado|safad[oa]|tesar|tesão)\b/gi, severity: 'medium' },
];

const VIOLENCE_PATTERNS: { pattern: RegExp; severity: 'medium' | 'high' }[] = [
  { pattern: /\b(matar|assassin|estupro|estuprar|tortur|gore|mutila[rç]|decapit|sangue\s*jorrando)\b/gi, severity: 'high' },
  { pattern: /\b(bater\s*em|espancar|agredir|ameaç|surrar)\b/gi, severity: 'medium' },
];

const SPAM_PATTERNS: { pattern: RegExp; severity: 'low' | 'medium' }[] = [
  { pattern: /\b(ganhe\s*dinheiro\s*fácil|renda\s*extra\s*garantida|fique\s*ric[oa]\s*já|lucro\s*garantido|esquema\s*de\s*pirâmide)\b/gi, severity: 'medium' },
  { pattern: /\b(clique\s*aqui\s*agora|oferta\s*imperdível\s*última\s*chance|vagas?\s*limitadíssima|só\s*hoje\s*últimas?\s*unidades?)\b/gi, severity: 'low' },
  { pattern: /(🔥{3,}|💰{3,}|🤑{3,}|💸{3,})/g, severity: 'low' },
  { pattern: /(.)\1{8,}/g, severity: 'low' }, // Repeated characters 9+
  { pattern: /[A-Z\s]{30,}/g, severity: 'low' }, // ALL CAPS long text
];

const SCAM_PATTERNS: { pattern: RegExp; severity: 'medium' | 'high' }[] = [
  { pattern: /\b(pix\s*agora|envie?\s*pix|deposite?\s*agora|transfira?\s*para|chave\s*pix\s*\S+)\b/gi, severity: 'high' },
  { pattern: /\b(investimento?\s*garantido|rentabilidade\s*\d+%|bitcoin\s*fácil|criptomoeda\s*garanti)\b/gi, severity: 'high' },
  { pattern: /\b(promoção\s*falsa|sorteio\s*fake|golpe|fraude|pirâmide\s*financeira)\b/gi, severity: 'medium' },
];

const PERSONAL_INFO_PATTERNS: { pattern: RegExp; severity: 'medium' | 'high' }[] = [
  { pattern: /\b\d{3}[\.\-]?\d{3}[\.\-]?\d{3}[\.\-]?\d{2}\b/g, severity: 'high' }, // CPF
  { pattern: /\b\d{2}[\.\-]?\d{3}[\.\-]?\d{3}[\/\-]?\d{4}[\.\-]?\d{2}\b/g, severity: 'high' }, // CNPJ
  { pattern: /\b(?:\+55\s?)?\(?\d{2}\)?\s?\d{4,5}[\-\s]?\d{4}\b/g, severity: 'medium' }, // Phone BR
  { pattern: /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g, severity: 'high' }, // Credit card
  { pattern: /\bsenha[\s:]*\S+/gi, severity: 'high' }, // Password exposure
];

const SELF_HARM_PATTERNS: { pattern: RegExp; severity: 'high' }[] = [
  { pattern: /\b(suicíd|se\s*matar|eu\s*quero\s*morrer|cortar\s*(os\s*)?pulso|autolesão|automutil)\b/gi, severity: 'high' },
];

// ============ CORE MODERATION ============

export function moderateContent(text: string, options?: {
  strictMode?: boolean;
  allowMildProfanity?: boolean;
  checkPersonalInfo?: boolean;
}): ModerationResult {
  const {
    strictMode = false,
    allowMildProfanity = false,
    checkPersonalInfo = true,
  } = options || {};

  const flags: ModerationFlag[] = [];

  // 1. Profanity
  for (const { pattern, severity } of PROFANITY_PATTERNS) {
    if (allowMildProfanity && severity === 'low') continue;
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        flags.push({
          type: 'profanity',
          severity,
          match,
          reason: severity === 'high' ? 'Linguagem ofensiva detectada' : 'Linguagem inapropriada leve',
        });
      }
    }
  }

  // 2. Hate speech
  for (const { pattern, severity } of HATE_SPEECH_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        flags.push({ type: 'hate_speech', severity, match, reason: 'Discurso de ódio detectado' });
      }
    }
  }

  // 3. Sexual content
  for (const { pattern, severity } of SEXUAL_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        flags.push({ type: 'sexual', severity, match, reason: 'Conteúdo sexual detectado' });
      }
    }
  }

  // 4. Violence
  for (const { pattern, severity } of VIOLENCE_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        flags.push({ type: 'violence', severity, match, reason: 'Conteúdo violento detectado' });
      }
    }
  }

  // 5. Spam
  for (const { pattern, severity } of SPAM_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        flags.push({ type: 'spam', severity, match: match.substring(0, 50), reason: 'Padrão de spam detectado' });
      }
    }
  }

  // 6. Scam
  for (const { pattern, severity } of SCAM_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        flags.push({ type: 'scam', severity, match, reason: 'Possível golpe/scam detectado' });
      }
    }
  }

  // 7. Personal info
  if (checkPersonalInfo) {
    for (const { pattern, severity } of PERSONAL_INFO_PATTERNS) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          flags.push({
            type: 'personal_info',
            severity,
            match: match.replace(/\d/g, '*'), // Mask digits
            reason: 'Informação pessoal detectada (CPF, telefone, cartão)',
          });
        }
      }
    }
  }

  // 8. Self-harm
  for (const { pattern, severity } of SELF_HARM_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        flags.push({ type: 'self_harm', severity, match, reason: 'Conteúdo sobre autolesão detectado' });
      }
    }
  }

  // Calculate score
  let score = 0;
  for (const flag of flags) {
    switch (flag.severity) {
      case 'high': score += 0.4; break;
      case 'medium': score += 0.2; break;
      case 'low': score += 0.05; break;
    }
  }
  score = Math.min(1, score);

  // Determine approval
  const hasHighSeverity = flags.some(f => f.severity === 'high');
  const threshold = strictMode ? 0.1 : 0.3;
  const approved = !hasHighSeverity && score < threshold;

  // Generate suggestions
  const suggestions: string[] = [];
  const categories = [...new Set(flags.map(f => f.type))];

  if (categories.includes('profanity')) {
    suggestions.push('Remova ou substitua palavras ofensivas para manter o profissionalismo');
  }
  if (categories.includes('personal_info')) {
    suggestions.push('Remova dados pessoais (CPF, telefone, cartão) antes de publicar');
  }
  if (categories.includes('spam')) {
    suggestions.push('Reduza o uso de CAPS LOCK, emojis repetidos e frases apelativas');
  }
  if (categories.includes('scam')) {
    suggestions.push('Remova referências a PIX, transferências e promessas financeiras');
  }
  if (categories.includes('hate_speech')) {
    suggestions.push('Conteúdo com discurso de ódio viola as políticas de todas as redes sociais');
  }
  if (categories.includes('self_harm')) {
    suggestions.push('Se você ou alguém precisa de ajuda, ligue para o CVV: 188');
  }

  return { approved, score, flags, suggestions };
}

// ============ AI MODERATION (OpenAI) ============

export async function moderateWithAI(text: string): Promise<ModerationResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: text }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const result = data.results?.[0];
    if (!result) return null;

    const flags: ModerationFlag[] = [];
    const categoryMap: Record<string, ModerationCategory> = {
      'hate': 'hate_speech',
      'hate/threatening': 'hate_speech',
      'harassment': 'hate_speech',
      'harassment/threatening': 'violence',
      'self-harm': 'self_harm',
      'self-harm/intent': 'self_harm',
      'self-harm/instructions': 'self_harm',
      'sexual': 'sexual',
      'sexual/minors': 'sexual',
      'violence': 'violence',
      'violence/graphic': 'violence',
    };

    for (const [category, flagged] of Object.entries(result.categories)) {
      if (flagged) {
        const type = categoryMap[category] || 'misleading';
        const score = result.category_scores?.[category] || 0;
        flags.push({
          type,
          severity: score > 0.8 ? 'high' : score > 0.4 ? 'medium' : 'low',
          match: category,
          reason: `OpenAI Moderation: ${category} (${(score * 100).toFixed(0)}%)`,
        });
      }
    }

    const score = Math.min(1, flags.reduce((sum, f) => {
      return sum + (f.severity === 'high' ? 0.5 : f.severity === 'medium' ? 0.25 : 0.1);
    }, 0));

    return {
      approved: !result.flagged,
      score,
      flags,
      suggestions: result.flagged
        ? ['O conteúdo foi detectado como inapropriado pela IA. Revise antes de publicar.']
        : [],
    };
  } catch {
    return null;
  }
}

// ============ COMBINED MODERATION ============

export async function fullModeration(text: string, options?: {
  strictMode?: boolean;
  skipAI?: boolean;
}): Promise<ModerationResult> {
  // Layer 1: Regex-based (instant)
  const regexResult = moderateContent(text, {
    strictMode: options?.strictMode,
    checkPersonalInfo: true,
  });

  // If regex already blocks with high severity, no need for AI
  if (regexResult.flags.some(f => f.severity === 'high')) {
    return regexResult;
  }

  // Layer 2: AI moderation (if available and not skipped)
  if (!options?.skipAI) {
    const aiResult = await moderateWithAI(text);
    if (aiResult) {
      // Merge results
      const allFlags = [...regexResult.flags, ...aiResult.flags];
      const maxScore = Math.max(regexResult.score, aiResult.score);
      const approved = regexResult.approved && aiResult.approved;
      const suggestions = [...new Set([...regexResult.suggestions, ...aiResult.suggestions])];

      return { approved, score: maxScore, flags: allFlags, suggestions };
    }
  }

  return regexResult;
}

// ============ PLATFORM-SPECIFIC VALIDATION ============

export interface PlatformValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateForPlatform(content: string, platform: string, mediaUrls?: string[]): PlatformValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  switch (platform) {
    case 'instagram':
      if (content.length > 2200) errors.push('Instagram: legenda máx. 2.200 caracteres');
      if (!mediaUrls?.length) errors.push('Instagram: requer pelo menos 1 imagem ou vídeo');
      if ((content.match(/#\w+/g) || []).length > 30) warnings.push('Instagram: máx. 30 hashtags recomendado');
      if ((content.match(/@\w+/g) || []).length > 20) warnings.push('Instagram: muitas menções podem parecer spam');
      break;

    case 'facebook':
      if (content.length > 63206) errors.push('Facebook: texto máx. 63.206 caracteres');
      if (content.length > 500) warnings.push('Facebook: posts curtos (<500 chars) têm melhor engajamento');
      break;

    case 'twitter':
    case 'x':
      if (content.length > 280) errors.push('Twitter/X: máx. 280 caracteres');
      if (content.length > 250 && (content.match(/#\w+/g) || []).length > 3) {
        warnings.push('Twitter: muitas hashtags reduzem engajamento');
      }
      break;

    case 'linkedin':
      if (content.length > 3000) errors.push('LinkedIn: texto máx. 3.000 caracteres');
      if ((content.match(/#\w+/g) || []).length > 5) warnings.push('LinkedIn: máx. 3-5 hashtags recomendado');
      break;

    case 'tiktok':
      if (content.length > 2200) errors.push('TikTok: descrição máx. 2.200 caracteres');
      if (!mediaUrls?.length) errors.push('TikTok: requer vídeo');
      break;

    case 'youtube':
      if (content.length > 5000) errors.push('YouTube: descrição máx. 5.000 caracteres');
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
