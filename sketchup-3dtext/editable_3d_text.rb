# encoding: UTF-8
# ==============================================================================
# Editable 3D Text (수정 가능한 3D 텍스트)
# 스케치업에서 생성한 3D 텍스트의 파라미터(내용, 폰트, 크기, 돌출 등)를
# Attribute Dictionary에 보존하여 언제든 수정/업데이트할 수 있도록 해주는 플러그인입니다.
# ==============================================================================

require 'sketchup.rb'

module Antigravity
  module Editable3DText
    DICT_NAME = 'AGY_Editable3DText'

    DEFAULT_CONFIG = {
      text: '3D 텍스트',
      font: '맑은 고딕',
      height: 100.0,      # mm
      extrusion: 10.0,    # mm
      filled: true,
      bold: false,
      italic: false,
      align: 0            # 0: Left, 1: Center, 2: Right
    }.freeze

    FONT_LIST = [
      ['맑은 고딕',        '맑은 고딕 (Malgun Gothic)'],
      ['Pretendard',       'Pretendard'],
      ['Noto Sans KR',     'Noto Sans KR'],
      ['Arial',            'Arial'],
      ['Tahoma',           'Tahoma'],
      ['Verdana',          'Verdana'],
      ['Times New Roman',  'Times New Roman']
    ].freeze

    ALIGN_LIST = [
      [0, '왼쪽 맞춤'],
      [1, '가운데 맞춤'],
      [2, '오른쪽 맞춤']
    ].freeze

    def self.open_dialog(target_group = nil)
      current_data = DEFAULT_CONFIG.dup

      if target_group && target_group.valid?
        current_data[:text]      = target_group.get_attribute(DICT_NAME, 'text', current_data[:text])
        current_data[:font]      = target_group.get_attribute(DICT_NAME, 'font', current_data[:font])
        current_data[:height]    = target_group.get_attribute(DICT_NAME, 'height', current_data[:height])
        current_data[:extrusion] = target_group.get_attribute(DICT_NAME, 'extrusion', current_data[:extrusion])
        current_data[:filled]    = target_group.get_attribute(DICT_NAME, 'filled', current_data[:filled])
        current_data[:bold]      = target_group.get_attribute(DICT_NAME, 'bold', current_data[:bold])
        current_data[:italic]    = target_group.get_attribute(DICT_NAME, 'italic', current_data[:italic])
        current_data[:align]     = target_group.get_attribute(DICT_NAME, 'align', current_data[:align])
      end

      dialog = UI::HtmlDialog.new({
        dialog_title: target_group ? '✏️ 3D 텍스트 수정' : '✨ 새 3D 텍스트 생성',
        preferences_key: 'AGY_Editable3DText_Dialog',
        scrollable: false,
        resizable: true,
        width: 440,
        height: 580,
        min_width: 380,
        min_height: 520,
        style: UI::HtmlDialog::STYLE_DIALOG
      })

      dialog.set_html(generate_html(current_data, !target_group.nil?))

      dialog.add_action_callback('cancel') do |_action_context|
        dialog.close
      end

      dialog.add_action_callback('apply') do |_action_context, params|
        model = Sketchup.active_model
        model.start_operation(target_group ? '3D 텍스트 수정' : '새 3D 텍스트 생성', true)

        begin
          if target_group && target_group.valid?
            update_existing_text(target_group, params)
          else
            create_new_text(params)
          end
          model.commit_operation
          dialog.close
        rescue => e
          model.abort_operation
          UI.messagebox("오류가 발생했습니다: #{e.message}")
        end
      end

      dialog.show
    end

    def self.create_new_text(data)
      model = Sketchup.active_model
      entities = model.active_entities
      group = entities.add_group
      build_3d_text_inside_group(group, data)
      model.selection.clear
      model.selection.add(group)
    end

    def self.update_existing_text(group, data)
      group.entities.clear!
      build_3d_text_inside_group(group, data)
    end

    def self.build_3d_text_inside_group(group, data)
      text_str  = data['text'].to_s
      font_name = data['font'].to_s
      h_mm      = data['height'].to_f
      ext_mm    = data['extrusion'].to_f
      filled    = data['filled'] == true || data['filled'] == 'true'
      bold      = data['bold'] == true || data['bold'] == 'true'
      italic    = data['italic'] == true || data['italic'] == 'true'
      align_idx = data['align'].to_i

      h_inch   = h_mm.mm
      ext_inch = ext_mm.mm

      group.entities.add_3d_text(
        text_str, align_idx, font_name, bold, italic,
        h_inch, 0.0, 0.0, filled, ext_inch
      )

      group.name = "[3D Text] #{text_str[0..15]}"
      group.set_attribute(DICT_NAME, 'text', text_str)
      group.set_attribute(DICT_NAME, 'font', font_name)
      group.set_attribute(DICT_NAME, 'height', h_mm)
      group.set_attribute(DICT_NAME, 'extrusion', ext_mm)
      group.set_attribute(DICT_NAME, 'filled', filled)
      group.set_attribute(DICT_NAME, 'bold', bold)
      group.set_attribute(DICT_NAME, 'italic', italic)
      group.set_attribute(DICT_NAME, 'align', align_idx)
    end

    def self.register_selected_as_editable
      model = Sketchup.active_model
      sel = model.selection

      if sel.empty? || sel.length > 1 || !sel.first.is_a?(Sketchup::Group)
        UI.messagebox("등록할 3D 텍스트 '단일 그룹'을 1개 선택한 뒤 실행해주세요.")
        return
      end

      group = sel.first
      open_dialog(group)
    end

    def self.font_options(selected_font)
      FONT_LIST.map { |value, label|
        mark = (selected_font.to_s == value) ? ' selected' : ''
        "<option value=\"#{escape_html(value)}\"#{mark}>#{escape_html(label)}</option>"
      }.join("\n            ")
    end

    def self.align_options(selected_align)
      ALIGN_LIST.map { |value, label|
        mark = (selected_align.to_i == value) ? ' selected' : ''
        "<option value=\"#{value}\"#{mark}>#{escape_html(label)}</option>"
      }.join("\n            ")
    end

    def self.generate_html(data, is_edit_mode)
      <<-HTML
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Pretendard", "맑은 고딕", sans-serif; }
    body { background-color: #fcfbfa; color: #2b2320; padding: 20px; font-size: 13px; user-select: none; }
    .header { display: flex; align-items: center; gap: 8px; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid #ebdcd0; }
    .header h2 { font-size: 16px; font-weight: 700; color: #9a3412; }
    .form-group { margin-bottom: 14px; }
    label { display: block; font-size: 12px; font-weight: 600; color: #5c4d46; margin-bottom: 6px; }
    input[type="text"], input[type="number"], select, textarea { width: 100%; padding: 8px 10px; border: 1px solid #dcd1c7; border-radius: 6px; background: #fff; color: #2b2320; font-size: 13px; outline: none; transition: border-color 0.2s; }
    textarea { resize: vertical; min-height: 54px; }
    input[type="text"]:focus, input[type="number"]:focus, select:focus, textarea:focus { border-color: #ea580c; }
    .row { display: flex; gap: 12px; }
    .col { flex: 1; }
    .checkbox-group { display: flex; gap: 16px; align-items: center; background: #f4eee9; padding: 10px 12px; border-radius: 6px; }
    .checkbox-item { display: flex; align-items: center; gap: 5px; cursor: pointer; font-size: 12px; margin-bottom: 0; }
    .checkbox-item input { cursor: pointer; width: auto; }
    .btn-group { display: flex; justify-content: flex-end; gap: 8px; margin-top: 22px; padding-top: 14px; border-top: 1px solid #ebdcd0; }
    button { padding: 9px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: opacity 0.2s, transform 0.1s; }
    button:active { transform: scale(0.98); }
    .btn-cancel { background: #e7ded7; color: #53453f; }
    .btn-apply { background: #ea580c; color: #fff; }
    .unit-input { position: relative; display: flex; align-items: center; }
    .unit-input input { padding-right: 32px; }
    .unit-input span { position: absolute; right: 10px; color: #8c7e75; font-size: 11px; pointer-events: none; }
  </style>
</head>
<body>
  <div class="header">
    <h2>#{is_edit_mode ? '✏️ 3D 텍스트 속성 수정' : '✨ 새 3D 텍스트 만들기'}</h2>
  </div>

  <div class="form-group">
    <label for="txt-content">텍스트 내용</label>
    <textarea id="txt-content" spellcheck="false">#{escape_html(data[:text])}</textarea>
  </div>

  <div class="form-group">
    <label for="txt-font">글꼴 (Font)</label>
    <select id="txt-font">
            #{font_options(data[:font])}
    </select>
  </div>

  <div class="form-group">
    <label for="txt-align">텍스트 정렬</label>
    <select id="txt-align">
            #{align_options(data[:align])}
    </select>
  </div>

  <div class="row">
    <div class="col form-group">
      <label for="txt-height">글자 높이 (Height)</label>
      <div class="unit-input">
        <input type="number" id="txt-height" value="#{data[:height].to_f}" step="1" min="1">
        <span>mm</span>
      </div>
    </div>
    <div class="col form-group">
      <label for="txt-extrusion">돌출 깊이 (Extrusion)</label>
      <div class="unit-input">
        <input type="number" id="txt-extrusion" value="#{data[:extrusion].to_f}" step="1" min="0">
        <span>mm</span>
      </div>
    </div>
  </div>

  <div class="form-group">
    <label>스타일 옵션</label>
    <div class="checkbox-group">
      <label class="checkbox-item"><input type="checkbox" id="chk-filled" #{data[:filled] ? 'checked' : ''}> 면 채우기 (Filled)</label>
      <label class="checkbox-item"><input type="checkbox" id="chk-bold" #{data[:bold] ? 'checked' : ''}> 굵게 (Bold)</label>
      <label class="checkbox-item"><input type="checkbox" id="chk-italic" #{data[:italic] ? 'checked' : ''}> 기울임 (Italic)</label>
    </div>
  </div>

  <div class="btn-group">
    <button class="btn-cancel" onclick="sketchup.cancel();">취소</button>
    <button class="btn-apply" onclick="submitData();">#{is_edit_mode ? '변경사항 적용' : '3D 텍스트 생성'}</button>
  </div>

  <script>
    function submitData() {
      var text = document.getElementById('txt-content').value;
      if (!text || text.trim().length === 0) {
        alert('내용을 입력해주세요.');
        return;
      }
      var payload = {
        text: text,
        font: document.getElementById('txt-font').value,
        align: parseInt(document.getElementById('txt-align').value, 10),
        height: parseFloat(document.getElementById('txt-height').value) || 100.0,
        extrusion: parseFloat(document.getElementById('txt-extrusion').value) || 0.0,
        filled: document.getElementById('chk-filled').checked,
        bold: document.getElementById('chk-bold').checked,
        italic: document.getElementById('chk-italic').checked
      };
      sketchup.apply(payload);
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { sketchup.cancel(); }
    });
  </script>
</body>
</html>
      HTML
    end

    def self.escape_html(str)
      return '' unless str
      str.to_s
         .gsub('&', '&amp;')
         .gsub('<', '&lt;')
         .gsub('>', '&gt;')
         .gsub('"', '&quot;')
    end

    unless file_loaded?(__FILE__)
      ext_menu = UI.menu('Plugins') || UI.menu('Extensions')
      sub_menu = ext_menu.add_submenu('✏️ 3D 텍스트 편집기')

      sub_menu.add_item('✨ 새 3D 텍스트 생성...') { open_dialog(nil) }

      sub_menu.add_item('🔄 선택한 3D 텍스트 수정...') {
        sel = Sketchup.active_model.selection
        if !sel.empty? && sel.first.is_a?(Sketchup::Group)
          open_dialog(sel.first)
        else
          UI.messagebox('수정할 3D 텍스트 그룹을 먼저 선택해주세요.')
        end
      }

      sub_menu.add_item('📌 기존 일반 3D 텍스트 등록...') { register_selected_as_editable }

      UI.add_context_menu_handler do |context_menu|
        sel = Sketchup.active_model.selection
        if sel.length == 1 && sel.first.is_a?(Sketchup::Group)
          group = sel.first
          has_attr = !group.get_attribute(DICT_NAME, 'text').nil?
          if has_attr
            context_menu.add_separator
            context_menu.add_item('✏️ 3D 텍스트 수정하기') { open_dialog(group) }
          else
            context_menu.add_separator
            context_menu.add_item('📌 3D 텍스트 편집기로 등록/수정') { open_dialog(group) }
          end
        end
      end

      file_loaded(__FILE__)
    end
  end
end
