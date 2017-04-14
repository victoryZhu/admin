;(function($){
/**
 * jqGrid Chinese Translation for v4.2
 * henryyan 2011.11.30
 * http://www.wsria.com
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * 
 * update 2011.11.30
 *		add double u3000 SPACE for search:odata to fix SEARCH box display err when narrow width from only use of eq/ne/cn/in/lt/gt operator under IE6/7
**/
$.jgrid = $.jgrid || {};
$.extend($.jgrid,{
	defaults : {
		recordtext: "{0} - {1}条,共 {2} 条",//"{0} - {1}\u3000共 {2} 条",	// 共字前是全角空格
		emptyrecords: "无数据显示",
		loadtext: "读取中...",
		pgtext :"第 {0} 页,共 {1} 页"// " {0} 共 {1} 页"
	},
	search : {
		caption: "搜索...",
		Find: "查找",
		Reset: "重置",
		odata: [{ oper:'eq', text:'等于\u3000\u3000'},{ oper:'ne', text:'不等\u3000\u3000'},{ oper:'lt', text:'小于\u3000\u3000'},{ oper:'le', text:'小于等于'},{ oper:'gt', text:'大于\u3000\u3000'},{ oper:'ge', text:'大于等于'},{ oper:'bw', text:'开始于'},{ oper:'bn', text:'不开始于'},{ oper:'in', text:'属于\u3000\u3000'},{ oper:'ni', text:'不属于'},{ oper:'ew', text:'结束于'},{ oper:'en', text:'不结束于'},{ oper:'cn', text:'包含\u3000\u3000'},{ oper:'nc', text:'不包含'},{ oper:'nu', text:'不存在'},{ oper:'nn', text:'存在'}],
        groupOps: [ { op: "AND", text: "所有" },    { op: "OR",  text: "任一" } ],
		operandTitle : "Click to select search operation.",
		resetTitle : "Reset Search Value"
	},
	edit : {
        addCaption: "添加记录",
        editCaption: "编辑记录",
        bSubmit: "提交",
        bCancel: "取消",
        bClose: "关闭",
        saveData: "数据已改变，是否保存？",
        bYes : "是",
        bNo : "否",
        bExit : "取消",
        msg: {
            required:"此字段必需",
            number:"请输入有效数字",
            minValue:"输值必须大于等于 ",
            maxValue:"输值必须小于等于 ",
            email: "这不是有效的e-mail地址",
            integer: "请输入有效整数",
            date: "请输入有效时间",
            url: "无效网址。前缀必须为 ('http://' 或 'https://')",
            nodefined : " 未定义！",
            novalue : " 需要返回值！",
            customarray : "自定义函数需要返回数组！",
            customfcheck : "必须有自定义函数！",
            passwordStrength:"密码强度不够！",
            passwordConfirm:"{0}和{1}不一致！"
        }
    },
    view : {
        caption: "查看记录",
        bClose: "关闭"
    },
    del : {
        caption: "删除",
        msg: "删除所选记录？",
        bSubmit: "删除",
        bCancel: "取消"
    },
	nav : {
		edittext: "修改",
		edittitle: "编辑所选记录",
		addtext:"新增",
		addtitle: "添加新记录",
		deltext: "删除",
		deltitle: "删除所选记录",
		searchtext: "查询",
		searchtitle: "查找",
		refreshtext: "刷新",
		refreshtitle: "刷新表格",
		alertcap: "注意",
		alerttext: "请选择记录",
		viewtext: "查看",
		viewtitle: "查看所选记录"
	},
	col : {
        caption: "选择列",
        bSubmit: "确定",
        bCancel: "取消"
    }, 
    errors : {
        errcap : "错误",
        nourl : "没有设置url",
        norecords: "没有要处理的记录",
        model : "colNames 和 colModel 长度不等！"
    },
    formatter : {
        integer : {thousandsSeparator: ",", defaultValue: '0'},
        number : {decimalSeparator:".", thousandsSeparator: ",", decimalPlaces: 2, defaultValue: '0.00'},
        currency : {decimalSeparator:".", thousandsSeparator: ",", decimalPlaces: 2, prefix: "", suffix:"", defaultValue: '0.00'},
        date : {
            dayNames:   [
                "日", "一", "二", "三", "四", "五", "六",
                "星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六",
            ],
            monthNames: [
                "一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二",
                "一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"
            ],
            AmPm : ["am","pm","上午","下午"],
            S: function (j) {return j < 11 || j > 13 ? ['st', 'nd', 'rd', 'th'][Math.min((j - 1) % 10, 3)] : 'th';},
            srcformat: 'Y-m-d',
            newformat: 'Y-m-d',
            parseRe : /[#%\\\/:_;.,\t\s-]/,
            masks : {
                // see http://php.net/manual/en/function.date.php for PHP format used in jqGrid
                // and see http://docs.jquery.com/UI/Datepicker/formatDate
                // and https://github.com/jquery/globalize#dates for alternative formats used frequently
                // one can find on https://github.com/jquery/globalize/tree/master/lib/cultures many
                // information about date, time, numbers and currency formats used in different countries
                // one should just convert the information in PHP format
                ISO8601Long:"Y-m-d H:i:s",
                ISO8601Short:"Y-m-d",
                // short date:
                //    n - Numeric representation of a month, without leading zeros
                //    j - Day of the month without leading zeros
                //    Y - A full numeric representation of a year, 4 digits
                // example: 3/1/2012 which means 1 March 2012
                ShortDate: "n/j/Y", // in jQuery UI Datepicker: "M/d/yyyy"
                // long date:
                //    l - A full textual representation of the day of the week
                //    F - A full textual representation of a month
                //    d - Day of the month, 2 digits with leading zeros
                //    Y - A full numeric representation of a year, 4 digits
                LongDate: "l, F d, Y", // in jQuery UI Datepicker: "dddd, MMMM dd, yyyy"
                // long date with long time:
                //    l - A full textual representation of the day of the week
                //    F - A full textual representation of a month
                //    d - Day of the month, 2 digits with leading zeros
                //    Y - A full numeric representation of a year, 4 digits
                //    g - 12-hour format of an hour without leading zeros
                //    i - Minutes with leading zeros
                //    s - Seconds, with leading zeros
                //    A - Uppercase Ante meridiem and Post meridiem (AM or PM)
                FullDateTime: "l, F d, Y g:i:s A", // in jQuery UI Datepicker: "dddd, MMMM dd, yyyy h:mm:ss tt"
                // month day:
                //    F - A full textual representation of a month
                //    d - Day of the month, 2 digits with leading zeros
                MonthDay: "F d", // in jQuery UI Datepicker: "MMMM dd"
                // short time (without seconds)
                //    g - 12-hour format of an hour without leading zeros
                //    i - Minutes with leading zeros
                //    A - Uppercase Ante meridiem and Post meridiem (AM or PM)
                ShortTime: "g:i A", // in jQuery UI Datepicker: "h:mm tt"
                // long time (with seconds)
                //    g - 12-hour format of an hour without leading zeros
                //    i - Minutes with leading zeros
                //    s - Seconds, with leading zeros
                //    A - Uppercase Ante meridiem and Post meridiem (AM or PM)
                LongTime: "g:i:s A", // in jQuery UI Datepicker: "h:mm:ss tt"
                SortableDateTime: "Y-m-d\\TH:i:s",
                UniversalSortableDateTime: "Y-m-d H:i:sO",
                // month with year
                //    Y - A full numeric representation of a year, 4 digits
                //    F - A full textual representation of a month
                YearMonth: "F, Y" // in jQuery UI Datepicker: "MMMM, yyyy"
            },
            reformatAfterEdit : false
        },
        baseLinkUrl: '',
        showAction: '',
        target: '',
        checkbox : {disabled:true},
        idName : 'id'
    }
});
})(jQuery);

/* Simplified Chinese translation for the jQuery Timepicker Addon /
/ Written by Will Lu */
(function($) {
	$.datepicker.regional['zh-CN'] = {
			closeText: '关闭',
			prevText: '&#x3C;上月',
			nextText: '下月&#x3E;',
			currentText: '今天',
			monthNames: ['一月','二月','三月','四月','五月','六月',
			'七月','八月','九月','十月','十一月','十二月'],
			monthNamesShort: ['一月','二月','三月','四月','五月','六月',
			'七月','八月','九月','十月','十一月','十二月'],
			dayNames: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
			dayNamesShort: ['周日','周一','周二','周三','周四','周五','周六'],
			dayNamesMin: ['日','一','二','三','四','五','六'],
			weekHeader: '周',
			dateFormat: 'yy-mm-dd',
			firstDay: 1,
			isRTL: false,
			showMonthAfterYear: true,
			yearSuffix: '年'};
	$.datepicker.setDefaults($.datepicker.regional['zh-CN']);
	$.timepicker.regional['zh-CN'] = {
		timeOnlyTitle: '选择时间',
		timeText: '时间',
		hourText: '小时',
		minuteText: '分钟',
		secondText: '秒钟',
		millisecText: '毫秒',
		microsecText: '微秒',
		timezoneText: '时区',
		currentText: '现在时间',
		closeText: '关闭',
		timeFormat: 'HH:mm',
		amNames: ['AM', 'A'],
		pmNames: ['PM', 'P'],
		isRTL: false
	};
	$.timepicker.setDefaults($.timepicker.regional['zh-CN']);
})(jQuery);

(function($) {
	$.tysel={
		caption:"通用选取",
		bSubmit: "确定",
	    bCancel: "取消",
	    bClear:"清空",
	    clearMsg:"确定要清空所有已选择的记录吗？",
	    recordtext:"现有 {0} 条记录被选取"
	}; 
	$.fuzzysearch={
		title:"模糊查询",
		bSearch:"查找"
	};
	$.errortext={
			jqgridediterror:"状态:'{0}'. 错误代码: '{1}'",	
			jqgridloaderror:"{0} 装载数据  {1} : {2}",	
			tabloaderror:"不能装载这个标签页 tab. 我们会尽可能地修正这个标签页.如果这个标签页不是一个demo."	
	};
})(jQuery);

