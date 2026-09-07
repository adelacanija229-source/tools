# encoding: UTF-8
# ==============================================================================
# Auto Layer (자동 레이어 분류)
# 객체 이름의 키워드를 기준으로 레이어(태그)를 자동 생성하고 배치합니다.
# 컴포넌트와 그룹을 모두 처리하며, 중첩된 그룹 안까지 훑습니다.
# ==============================================================================

require 'sketchup.rb'

module Antigravity
  module AutoLayer

    # ── 키워드 → 레이어명 (원하는 대로 고쳐 쓰세요) ──────────
    LAYER_MAP = {
      '벽'        => 'Layer_벽',
      'Wall'      => 'Layer_벽',
      '창문'      => 'Layer_창문',
      'Window'    => 'Layer_창문',
      '문'        => 'Layer_문',
      'Door'      => 'Layer_문',
      '바닥'      => 'Layer_바닥',
      'Floor'     => 'Layer_바닥',
      '천장'      => 'Layer_천장',
      'Ceiling'   => 'Layer_천장',
      '지붕'      => 'Layer_지붕',
      'Roof'      => 'Layer_지붕',
      '가구'      => 'Layer_가구',
      'Furniture' => 'Layer_가구',
      '조명'      => 'Layer_조명',
      'Light'     => 'Layer_조명',
      '조경'      => 'Layer_조경',
      'Tree'      => 'Layer_조경',
      'Plant'     => 'Layer_조경',
    }.freeze

    ICON_DIR = File.join(File.dirname(__FILE__), 'auto_layer')

    def self.icon(name)
      path = File.join(ICON_DIR, name)
      File.exist?(path) ? path : nil
    end

    # 컴포넌트는 정의 이름, 그룹은 인스턴스 이름을 본다
    def self.name_of(ent)
      if ent.is_a?(Sketchup::ComponentInstance)
        n = ent.name.to_s
        n.empty? ? ent.definition.name.to_s : n
      elsif ent.is_a?(Sketchup::Group)
        n = ent.name.to_s
        n.empty? ? ent.entities.parent.name.to_s : n
      else
        ''
      end
    end

    def self.layer_for(name)
      LAYER_MAP.each { |kw, layer| return layer if name.include?(kw) }
      nil
    end

    # 중첩 그룹·컴포넌트 안까지 재귀로 훑는다
    def self.collect(entities, found = [])
      entities.each do |e|
        next unless e.is_a?(Sketchup::ComponentInstance) || e.is_a?(Sketchup::Group)
        found << e
        inner = e.is_a?(Sketchup::Group) ? e.entities : e.definition.entities
        collect(inner, found)
      end
      found
    end

    def self.run
      model  = Sketchup.active_model
      layers = model.layers
      sel    = model.selection

      targets = collect(sel.empty? ? model.active_entities : sel.to_a.select { |e|
        e.is_a?(Sketchup::ComponentInstance) || e.is_a?(Sketchup::Group)
      })
      # 선택이 있으면 선택한 것 자체도 대상에 포함
      unless sel.empty?
        sel.each { |e| targets << e if e.is_a?(Sketchup::ComponentInstance) || e.is_a?(Sketchup::Group) }
        targets.uniq!
      end

      if targets.empty?
        UI.messagebox('분류할 컴포넌트나 그룹이 없습니다.')
        return
      end

      moved, made, skipped = 0, [], 0
      model.start_operation('자동 레이어 분류', true)
      begin
        targets.each do |ent|
          layer_name = layer_for(name_of(ent))
          if layer_name.nil?
            skipped += 1
            next
          end
          layer = layers[layer_name]
          if layer.nil?
            layer = layers.add(layer_name)
            made << layer_name
          end
          ent.layer = layer
          moved += 1
        end
        model.commit_operation
      rescue => e
        model.abort_operation
        UI.messagebox("오류가 발생했습니다: #{e.message}")
        return
      end

      msg  = "✅ 완료\n\n"
      msg += "#{moved}개 객체를 레이어에 배치했습니다.\n"
      msg += "새로 만든 레이어: #{made.uniq.join(', ')}\n" unless made.empty?
      msg += "이름에 해당 키워드가 없어 건너뛴 객체: #{skipped}개" if skipped > 0
      UI.messagebox(msg)
    end

    # 현재 매핑 표를 보여준다
    def self.show_map
      lines = LAYER_MAP.map { |kw, layer| "  #{kw}  →  #{layer}" }.join("\n")
      UI.messagebox("객체 이름에 아래 키워드가 들어 있으면 해당 레이어로 보냅니다.\n\n" +
                    lines + "\n\n키워드를 바꾸려면 auto_layer.rb 의 LAYER_MAP 을 수정하세요.")
    end

    unless file_loaded?(__FILE__)
      ext_menu = UI.menu('Plugins') || UI.menu('Extensions')
      sub_menu = ext_menu.add_submenu('🗂 자동 레이어 분류')
      sub_menu.add_item('▶ 지금 분류 실행') { run }
      sub_menu.add_item('📋 키워드 표 보기') { show_map }

      UI.add_context_menu_handler do |ctx|
        sel = Sketchup.active_model.selection
        unless sel.empty?
          ctx.add_separator
          ctx.add_item('🗂 선택 객체 자동 레이어 분류') { run }
        end
      end

      # ── 툴바 ────────────────────────────────────────────
      toolbar = UI::Toolbar.new('자동 레이어 분류')

      run_cmd = UI::Command.new('자동 레이어 분류') { run }
      run_cmd.tooltip         = '자동 레이어 분류'
      run_cmd.status_bar_text = '객체 이름의 키워드를 보고 레이어를 만들어 배치합니다. 선택이 없으면 전체를 훑습니다.'
      if (s = icon('icon_24.png')) then run_cmd.small_icon = s end
      if (l = icon('icon_32.png')) then run_cmd.large_icon = l end
      toolbar.add_item(run_cmd)

      map_cmd = UI::Command.new('키워드 표') { show_map }
      map_cmd.tooltip         = '키워드 표 보기'
      map_cmd.status_bar_text = '어떤 이름이 어떤 레이어로 가는지 보여줍니다.'
      if (s = icon('icon_map_24.png')) then map_cmd.small_icon = s end
      if (l = icon('icon_map_32.png')) then map_cmd.large_icon = l end
      toolbar.add_item(map_cmd)

      toolbar.restore

      file_loaded(__FILE__)
    end
  end
end
