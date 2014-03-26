// Copyright (c) 2013, Web Notes Technologies Pvt. Ltd. and Contributors
// MIT License. See license.txt

$.extend(frappe.model, {
	docinfo: {},
	sync: function(r) {
		/* docs:
			extract docs, docinfo (attachments, comments, assignments)
			from incoming request and set in `locals` and `frappe.model.docinfo`
		*/

		if(!r.docs && !r.docinfo) r = {docs:r};

		if(r.docs) {
			var last_parent_name = null;
			var dirty = [];

			$.each(r.docs, function(i, d) {
				if(!d.name && d.__islocal) { // get name (local if required)
					frappe.model.clear_doc(d)
					d.name = frappe.model.get_new_name(d.doctype);
					frappe.provide("frappe.model.docinfo." + d.doctype + "." + d.name);	
				}

				if(!locals[d.doctype])
					locals[d.doctype] = {};

				locals[d.doctype][d.name] = d;
				d.__last_sync_on = new Date();
				
				if(d.doctype==="DocType") {
					frappe.meta.sync(d);
				}

				if(cur_frm && cur_frm.doctype==d.doctype && cur_frm.docname==d.name) {
					cur_frm.doc = d;
				}

				if(d.localname) {
					frappe.model.new_names[d.localname] = d.name;
					$(document).trigger('rename', [d.doctype, d.localname, d.name]);
					delete locals[d.doctype][d.localname];
				
					// update docinfo to new dict keys
					if(i===0) {
						frappe.model.docinfo[d.doctype][d.name] = frappe.model.docinfo[d.doctype][d.localname];
						frappe.model.docinfo[d.doctype][d.localname] = undefined;
					}
				}
			});
			
			if(cur_frm && dirty.indexOf(cur_frm.doctype)!==-1) cur_frm.dirty();

		}
		
		// set docinfo (comments, assign, attachments)
		if(r.docinfo) {
			if(r.docs) {
				var doc = r.docs[0];
			} else {
				var doc = cur_frm.doc;
			}
			if(!frappe.model.docinfo[doc.doctype])
				frappe.model.docinfo[doc.doctype] = {};
			frappe.model.docinfo[doc.doctype][doc.name] = r.docinfo;
		}
		
		return r.docs;
	},
	
});
