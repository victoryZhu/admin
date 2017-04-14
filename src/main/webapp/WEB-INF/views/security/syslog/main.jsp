<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%> 
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags"%>  
 
<script type="text/javascript"> 
var cur_ddid="";//主档当前ID 
var goto_ddid;//修改记录后定位主档ID

//日期控件，用于编辑和查询
function datePick(elem)
 {
    $(elem).datetimeCommon({showOn:'button',dtflag:'d'});     
 };
 
 $(function(){ 
	 //调整上下帧高度及GRID的行数
	 t_b_height_rownum(); 

	//主档grid定义	
	 $("#toplist").jqGrid({
			url: '<c:url value="/security/syslog/list" />', 
			datatype:"json",
			colNames:['','操作时间','操作类型','用户名','部门名称','姓名','IP地址'], 
			colModel:[ //这里会根据index去解析jsonReader中root对象的属性，填充cell      
			         {name:'id', index:'id', hidden:true,key:true,viewable:false},  //不用KEY:TRUE，下面prmNames中不要定义ID
			         {name:'opeTime', index:'opeTime', align:"center", width:150, sortable:false,searchoptions:{dataInit:datePick}},
			         {name:'opeType', index:'opeType', align:"center", width:80, sortable:false,stype:'select',searchoptions:{sopt:['eq','ne'],value:"Login:Login;Logout:Logout"}},
			         {name:'ryxx.username', index:'ryxx.username', align:"center", width:80, sortable:false},
			         {name:'ryxx.bmxx.bmmc', index:'ryxx.bmxx.bmmc', align:"center", width:150, sortable:false}, 
			         {name:'ryxx.name', index:'ryxx.name', align:"center", width:90, sortable:false},
			         {name:'ip', index:'ip', align:"center", width:100, sortable:false}],
			height: topGridHeight,   
			rowNum: numOfTopRow, //每页记录数  
			pager: '#toppager', //分页标签divID    
			sortable: false,
			sortname: "id",
			sortorder: "desc",            
			caption:'系统日志', //显示查询结果表格标题     
			hidegrid:false,  
			prmNames: {rows:"size", sort:"sidx", order:"sord"},  //适应controller中Pageable解析更改（spring data）
			onSelectRow:function(ids){ 
		      if(ids){ 
		            cur_ddid=ids;
		           }
			},
			gridComplete:function(){   
		       if($(this).getDataIDs().length>0){     
		    	   if(goto_ddid==null) 
			    	   $(this).jqGrid('setSelection',$(this).getDataIDs()[0]);
		    	   else{
		    		    $(this).jqGrid('setSelection',goto_ddid);
		    		   goto_ddid=null;
		    	   }
		       }
			}			
		}).navGrid('#toppager',{
			    edit:Boolean(false),
			    add:Boolean(false),
			    del:Boolean(false)
		    },
		    {//修改窗口相关属性  			  
			},
		    {//新增窗口相关属性 			    
			},
		    {//删除窗口相关属性 				 
			} 
		 ); 
	    jqGridButton("toplist","toppager"); 

		 $("#toplist").jqGrid('navButtonAdd','#toplist_toppager_left',{caption:'Pdf',title:'Pdf',id:"pdf_toplist_top",buttonicon:'ui-icon-document',
			  onClickButton:function(){				 
				  $("#toplist").jqGrid('excelExport',{tag:'pdf', url:'security/syslog/export'});
			}});    
		  $("#toplist").jqGrid('navButtonAdd','#toplist_toppager_left',{caption:'Excel',title:'Excel',id:"pexcel_toplist_top",buttonicon:'ui-icon-print',
			  onClickButton:function(){				  
				  $("#toplist").jqGrid('excelExport',{tag:'excel', url:'security/syslog/export'});
			}});
	 });
</script>

<div id="topdiv" class="chc_top_jqgrid">
    <table id="toplist" style="width:100%"><tr><td/></tr></table>
    <div id="toppager"></div>     
</div>    
	
 