$(function () {
  var customCommentItemTemplate = [
    '<li class="list-group-item">',
    '<div class="media">',
    '<div class="media-body">',
    '<h5 class="mt-0">{{username}}<small class="text-muted ml-3">{{datetime}}</small></h5>',
    '<p>{{comment}}</p>',
    '</div>',
    '</div>',
    '</li>',
  ].join('')

  var $body = $('body')
  var $customPublish = $('#customPublish')
  var $customUsername = $('#customUsername')
  var $customComment = $('#customComment')
  var $customCommentLists = $('#customCommentLists')
  var $exampleModalScrollable = $('#exampleModalScrollable')
  var $customRendererContent = $('#customRendererContent')
  var $customModalBody = $('#customModalBody')

  var rightRender = true
  var currentFeature = null

  $customPublish.on('click', function (e) {
    e.preventDefault()
    e.stopPropagation()

    var username = $customUsername.val()
    var comment = $customComment.val()

    if (!username) {
      alert('请输入用户名')
      return
    }

    if (!comment) {
      alert('请输入评论内容')
      return
    }

    $customComment.val('')

    saveCommentLists({
      username: username,
      comment: comment,
      datetime: moment().format('YYYY-MM-DD HH:mm:ss'),
    })

    renderLists()
  })

  $exampleModalScrollable.on('show.bs.modal', function (e) {
    renderLists()
  })

  $exampleModalScrollable.on('hidden.bs.modal', function (e) {
    $customCommentLists.html()
  })

  function saveCommentLists(comment, suffix) {
    if (!comment) return

    suffix = suffix ? '-' + suffix : ''

    var commentKey = 'commentLists' + suffix

    var commentLists = store.get(commentKey, []) || []

    commentLists.unshift(comment)

    store.set(commentKey, commentLists)
  }

  function renderLists(needRender, suffix) {
    suffix = suffix ? '-' + suffix : ''

    var commentKey = 'commentLists' + suffix

    var commentLists = store.get(commentKey, []) || []

    var commentListsHtml = commentLists
      .map(function (comment) {
        return customCommentItemTemplate
          .replace('{{username}}', comment.username)
          .replace('{{comment}}', comment.comment)
          .replace('{{datetime}}', comment.datetime)
      })
      .join('')

    if (needRender === false) return commentListsHtml

    $customCommentLists.html(commentListsHtml)
  }

  function customRenderer(feature) {
    currentFeature = feature

    if (rightRender) return

    var commentListsHtml = renderLists(false)

    $customRendererContent.html(commentListsHtml)
  }

  function getUniqueKey(feature) {
    feature = feature || currentFeature

    var companyName = feature.properties.CompanyName
    var address = feature.properties.Address
    var ratings = feature.properties.Ratings

    return companyName + '-' + address + '-' + ratings
  }

  window.customRenderer = customRenderer

  function customLayerShow() {
    if (!rightRender) return

    var modalBodyHtml = $customModalBody.html()

    $customRendererContent.html(modalBodyHtml)

    var commentListsHtml = renderLists(false, getUniqueKey())

    $customRendererContent.find('#customCommentLists').html(commentListsHtml)

    $customRendererContent.find('#customPublish').on('click', function (e) {
      e.preventDefault()
      e.stopPropagation()

      var $form = $(this).parents('form')

      var $customUsername = $form.find('#customUsername')
      var $customComment = $form.find('#customComment')

      var username = $customUsername.val()
      var comment = $customComment.val()

      if (!username) {
        alert('请输入用户名')
        return
      }

      if (!comment) {
        alert('请输入评论内容')
        return
      }

      $customComment.val('')

      var uniqueKey = getUniqueKey()

      saveCommentLists(
        {
          username: username,
          comment: comment,
          datetime: moment().format('YYYY-MM-DD HH:mm:ss'),
        },
        uniqueKey
      )

      var commentListsHtml = renderLists(false, uniqueKey)

      $customRendererContent.find('#customCommentLists').html(commentListsHtml)
    })
  }

  window.customLayerShow = customLayerShow

  function customLayerHidden() {
    if (!rightRender) return

    currentFeature = null

    $customRendererContent.find('#customPublish').off()

    $customRendererContent.html('')
  }

  window.customLayerHidden = customLayerHidden
})
