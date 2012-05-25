
function callbackAddProcedure(procedure_id) {
	var eye = $('input[name="ElementProcedureList\[eye_id\]"]:checked').val();

	$.ajax({
		'type': 'GET',
		'url': '/OphTrOperationnote/Default/loadElementByProcedure?procedure_id='+procedure_id+'&eye='+eye,
		'success': function(html) {
			if (html.length >0) {
				var m = html.match(/<div class="(Element.*?)"/);
				if (m) {
					m[1] = m[1].replace(/ .*$/,'');

					if ($('div.'+m[1]).length <1) {
						$('div.ElementAnaesthetic').before(html);
						$('div.'+m[1]).attr('style','display: none;');
						$('div.'+m[1]).removeClass('hidden');
						$('div.'+m[1]).slideToggle('fast');
					}
				}
			}
		}
	});
}

/*
 * Post the removed operation_id and an array of ElementType class names currently in the DOM
 * This should return any ElementType classes that we should remove.
 */

function callbackRemoveProcedure(procedure_id) {
	var procedures = '';

	$('div.procedureItem').children('input[type="hidden"]').map(function() {
		if (procedures.length >0) {
			procedures += ',';
		}
		procedures += $(this).val();
	});

	$.ajax({
		'type': 'POST',
		'url': '/OphTrOperationnote/Default/getElementsToDelete',
		'data': "remaining_procedures="+procedures+"&procedure_id="+procedure_id,
		'dataType': 'json',
		'success': function(data) {
			$.each(data, function(key, val) {
				$('div.'+val).slideToggle('fast',function() {
					$('div.'+val).remove();
				});
			});
		}
	});
}

function setCataractSelectInput(key, value) {
	$('#ElementCataract_'+key+'_id').children('option').map(function() {
		if ($(this).text() == value) {
			$('#ElementCataract_'+key+'_id').val($(this).val());
		}
	});
}

function setCataractInput(key, value) {
	$('#ElementCataract_'+key).val(value);
}

$(document).ready(function() {
	$('#et_save').unbind('click').click(function() {
		if (!$(this).hasClass('inactive')) {
			disableButtons();
			return true;
		}
		return false;
	});

	$('#et_cancel').unbind('click').click(function() {
		if (!$(this).hasClass('inactive')) {
			disableButtons();

			if (m = window.location.href.match(/\/update\/[0-9]+/)) {
				window.location.href = window.location.href.replace('/update/','/view/');
			} else {
				window.location.href = '/patient/episodes/'+et_patient_id;
			}
		}
		return false;
	});

	$('#et_deleteevent').unbind('click').click(function() {
		if (!$(this).hasClass('inactive')) {
			disableButtons();
			$('#deleteForm').submit();
		}
		return false;
	});

	$('#et_canceldelete').unbind('click').click(function() {
		if (!$(this).hasClass('inactive')) {
			disableButtons();

			if (m = window.location.href.match(/\/delete\/[0-9]+/)) {
				window.location.href = window.location.href.replace('/delete/','/view/');
			} else {
				window.location.href = '/patient/episodes/'+et_patient_id;
			}
		}
		return false;
	});

	$('#ElementCataract_incision_site_id').die('change').live('change',function(e) {
		e.preventDefault();

		magic.setDoodleParameter('PhakoIncision', 'incisionSite', $(this).children('option:selected').text());

		return false;
	});

	$('#ElementCataract_incision_type_id').die('change').live('change',function(e) {
		e.preventDefault();

		magic.setDoodleParameter('PhakoIncision', 'incisionType', $(this).children('option:selected').text());

		return false;
	});

	$('input[name="ElementProcedureList\[eye_id\]"]').die('change').live('change',function() {

		if ($('#typeProcedure').is(':hidden')) {
			$('#typeProcedure').slideToggle('fast');
		}

		magic.eye_changed($(this).val());
	});

	$('input[name="ElementAnaesthetic\[anaesthetic_type_id\]"]').die('click').live('click',function(e) {
		anaestheticSlide.handleEvent($(this));
	});

	$('#ElementCataract_meridian').die('change').live('change',function() {
		if (doodle = magic.getDoodle('PhakoIncision')) {
			if (doodle.getParameter('incisionMeridian') != $(this).val()) {
				doodle.setParameter('incisionMeridian',$(this).val());
				magic.repaintCataract();
				magic.followSurgeon = false;
			}
		}
	});

	$('#ElementCataract_length').die('change').live('change',function() {
		if (doodle = magic.getDoodle('PhakoIncision')) {
			doodle.setParameter('incisionLength',$(this).val());
			magic.repaintCataract();
		}
	});

	$('#ElementCataract_iol_type_id').die('change').live('change',function() {
		if ($(this).children('option:selected').text() == 'MTA3UO' || $(this).children('option:selected').text() == 'MTA4UO') {
			$('#ElementCataract_iol_position_id').val(4);
		}
	});
});

function AnaestheticSlide() {if (this.init) this.init.apply(this, arguments); }

AnaestheticSlide.prototype = {
	init : function(params) {
		this.anaestheticTypeSliding = false;
	},
	handleEvent : function(e) {
		var slide = false;

		if (!this.anaestheticTypeSliding) {
			if ((e.val() == 5 && !$('#ElementAnaesthetic_anaesthetist_id').is(':hidden')) ||
				(e.val() != 5 && $('#ElementAnaesthetic_anaesthetist_id').is(':hidden'))) {
				this.slide();
			}
		}

		// If topical anaesthetic type is selected, select topical delivery
		if (e.val() == 1) {
			$('#ElementAnaesthetic_anaesthetic_delivery_id_5').click();
		}
	},
	slide : function() {
		this.anaestheticTypeSliding = true;
		$('#ElementAnaesthetic_anaesthetist_id').slideToggle('fast');
		$('#ElementAnaesthetic_anaesthetic_delivery_id').slideToggle('fast');
		$('#div_ElementAnaesthetic_Agents').slideToggle('fast');
		$('#div_ElementAnaesthetic_Complications').slideToggle('fast');
		$('#div_ElementAnaesthetic_anaesthetic_comment').slideToggle('fast',function() {
			anaestheticSlide.anaestheticTypeSliding = false;
		});
	}
}

var anaestheticSlide = new AnaestheticSlide;
