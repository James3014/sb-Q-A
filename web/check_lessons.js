const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  const { data, error } = await supabase
    .from('lessons')
    .select('id, title, level_tags, is_premium')
    .contains('level_tags', ['beginner'])
    .order('id');
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`總共 ${data.length} 堂初級課程`);
  console.log(`免費課程: ${data.filter(l => !l.is_premium).length} 堂`);
  console.log(`付費課程: ${data.filter(l => l.is_premium).length} 堂`);
  console.log('\n前 5 堂：');
  data.slice(0, 5).forEach(l => {
    console.log(`${l.id} - ${l.title} - ${l.is_premium ? 'PRO' : 'FREE'}`);
  });
}

check();
